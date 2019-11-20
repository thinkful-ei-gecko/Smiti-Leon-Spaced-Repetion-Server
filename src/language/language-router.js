const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../classes/LinkedList');

const bodyParser = express.json();
const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
    const head = await LanguageService.getHead(
      req.app.get('db'),
      req.language.id,
    )
    let responseObj = {
      totalScore: head.total_score,
      wordCorrectCount: head.correct_count,
      wordIncorrectCount: head.incorrect_count,
      nextWord: head.original
    }

    res.json(responseObj)
    next()
  }
  catch(error) {
    console.log('----------------------------------> error');
    next(error)
  }
  })

languageRouter
  .post('/guess', bodyParser, async (req, res, next) => {

    //check if the guess was properly sent through, and store it in `guess`
    let {guess } = req.body;
    if (!guess || guess === '') {
      res.status(400).json({error: `Missing 'guess' in request body`})
      next();
    }

    //get the current head
    const head = await LanguageService.getHead(
      req.app.get('db'),
      req.language.id,
    );

    let headObj = {
      id: head.id,
      language_id: head.language_id,
      original: head.original,
      translation: head.translation,
      memory_value: head.memory_value,
      correct_count: head.correct_count,
      incorrect_count: head.incorrect_count
    };

    //get all the words
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    console.log(headObj);
    console.log('words----');
    console.log(words);

    //insert words into a linked list
    let wordsLL = new LinkedList;
    for (let i=0;i<words.length;i++) {
      let insertWord = {
        id: words[i].id,
        language_id: words[i].language_id,
        original: words[i].original,
        translation: words[i].translation,
        memory_value: words[i].memory_value,
        correct_count: words[i].correct_count,
        incorrect_count: words[i].incorrect_count
      }
      console.log('---------insertword-------');
      console.log(insertWord);
      wordsLL.insertLast(insertWord);
    }
    console.log('wordsLL.head------------------');
    console.log(wordsLL.head);
    let translation = head.translation;

    if (guess.toLowerCase() !== translation.toLowerCase()) {
      console.log('not correct');

      let totalScore = head.totalScore > 0 ? head.totalScore - 1 : 0;

      let removedOld = wordsLL.remove(headObj);
      console.log('removed successfully if');
      console.log(removedOld);
      removedOld.incorrect_count = removedOld.incorrect_count + 1;
      removedOld.memory_value = 1;
      wordsLL.insertAt(removedOld, removedOld.memoryValue);
      console.log('first stop');
      let currNode = wordsLL.head;
      let newHeadID = wordsLL.head.id;
      console.log('second stop');
      while (currNode !== null) {
        LanguageService.updateWord(
          req.app.get('db'),
          req.language.id,
          currNode.id,
          currNode.memory_value,
          currNode.correct_count,
          currNode.incorrect_count,
          currNode.next
        );
      }
      console.log('third stop');
      await LanguageService.updateHead(req.app.get('db'),req.language.id, newHeadId);
      await LanguageService.updateScore(req.app.get('db'),req.language.id, totalScore);
      console.log('fourth stop');
      res.status(200).json({isCorrect: false, totalScore: totalScore, wordCorrectCount: updatedHead.correct_count, wordIncorrectCount: updatedHead.incorrect_count, answer: updatedHead.translation, nextWord: updatedHead.original });
      console.log('last stop');
      next();
    }

    else if (guess.toLowerCase() === translation.toLowerCase()) {
      console.log('correct');
      res.status(200).json({isCorrect: true});
      next();
    }
  })

module.exports = languageRouter
