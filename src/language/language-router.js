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
      wordsLL.insertLast(insertWord);
    }
    let translation = head.translation;

    console.log('linked list');
    console.log(wordsLL);

    if (guess.toLowerCase() !== translation.toLowerCase()) {
      console.log('not correct');

      let totalScore = head.totalScore > 0 ? head.totalScore - 1 : 0;

      await wordsLL.moveToNext();
      headObj.memory_value = 1;
      wordsLL.insertAt(headObj, headObj.memory_value);
      console.log(wordsLL);
      console.log('----');
      console.log(wordsLL.head.next);
      let newHeadID = wordsLL.head.value.id;
      console.log(newHeadID);
      await LanguageService.updateHead(req.app.get('db'),req.language.id, newHeadID);
      let nextWordValue = await wordsLL.getNextWordValue();
      await LanguageService.updateScore(req.app.get('db'),req.language.id, totalScore);
      res.status(200).json({isCorrect: false, totalScore: totalScore, wordCorrectCount: headObj.correct_count, wordIncorrectCount: headObj.incorrect_count, answer: headObj.translation, nextWord: nextWordValue });
      incorrect_count = headObj.incorrect_count + 1;
      let currNode = wordsLL.head;
      console.log('currNode');
      console.log(currNode);
      while (currNode !== null) {
        LanguageService.updateWord(
          req.app.get('db'),
          req.language.id,
          currNode.id,
          currNode.memory_value,
          currNode.correct_count,
          currNode.value.id === headObj.id ? incorrect_count : currNode.incorrect_count,
          currNode.next == null ? null : currNode.next.value.id
        );
        currNode = currNode.next;
      }

      // let updatedWords = await LanguageService.getLanguageWords(
      //   req.app.get('db'),
      //   req.language.id
      // );

      // console.log('updated words----------------');
      // console.log(updatedWords);
      next();
    }

    else if (guess.toLowerCase() === translation.toLowerCase()) {
      console.log('correct');
      res.status(200).json({isCorrect: true});
      next();
    }
  })

module.exports = languageRouter
