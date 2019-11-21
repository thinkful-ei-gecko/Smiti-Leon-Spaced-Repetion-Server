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
    console.log(guess);
    if (!guess || guess === '') {
      return res.status(400).json({error: `Missing 'guess' in request body`})
    }

    try {
    //get current head for comparison and for total_score data
    const head = await LanguageService.getHead(
      req.app.get('db'),
      req.language.id
    );

    // console.log('----------------head-->');
    // console.log(head);

    //get total words to use for both correct & incorrect answers

    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    )

    // console.log('----------------words-->');
    // console.log(words);

    //set all words into a linked list starting with the head
    //put current head node aside

    let wordsLinkedList = new LinkedList();
    let currNodeID = head.head
    for(let i=0;i<words.length;i++) {
      let currNodeItem = words.find(item => item.id === currNodeID)
      let addItem = {
        id: currNodeItem.id,
        language_id: currNodeItem.language_id,
        original: currNodeItem.original,
        translation: currNodeItem.translation,
        memory_value: currNodeItem.memory_value,
        correct_count: currNodeItem.correct_count,
        incorrect_count: currNodeItem.incorrect_count
      };
      wordsLinkedList.insertLast(addItem);
      currNodeID = currNodeItem.next;
    }

    let originalHead = wordsLinkedList.head;
    // console.log('-------------linked list-->');
    // console.log(JSON.stringify(wordsLinkedList, null, 2));

    //compare if guess is true or false
    if (guess.toLowerCase() !== head.translation.toLowerCase()) {
      //incorrect guess
      
      let next = words.find(item => item.id === head.next);
      let nextOriginal = next.original;

      head.memory_value = 1;

      res.status(200).json({nextWord: nextOriginal, wordCorrectCount: next.correct_count, wordIncorrectCount: next.incorrect_count, totalScore: head.total_score, answer: head.translation, isCorrect: false})

      //set database and linked list to new information:

      //totalscore - 1
      let newTotalScore = head.total_score > 0 ? head.total_score - 1 : 0;
      await LanguageService.updateScore(req.app.get('db'),req.language.id, newTotalScore);

      //incorrect count increase
      originalHead.value.incorrect_count = originalHead.value.incorrect_count + 1;

      //head to next
      //next to old head
      //old head to next's next
      wordsLinkedList.head = wordsLinkedList.head.next;
      let tempNode = wordsLinkedList.head.next;
      wordsLinkedList.head.next = originalHead;
      originalHead.next = tempNode;
      await LanguageService.updateHead(req.app.get('db'),req.language.id, head.next);


    // console.log('-------------linked list-->');
    // console.log(JSON.stringify(wordsLinkedList, null, 2));
      //update each word in the database
      let currNodeCycle = wordsLinkedList.head;
      while (currNodeCycle != null) {
        // console.log('------------------currNodeCycle-->');
        // console.log(currNodeCycle);
        let updateObject = {
          memory_value: currNodeCycle.value.memory_value,
          correct_count: currNodeCycle.value.correct_count,
          incorrect_count: currNodeCycle.value.incorrect_count,
          next: currNodeCycle.next != null ? currNodeCycle.next.value.id : null
        }
        // console.log(updateObject.memory_value);
        // console.log(updateObject.incorrect_count);
        // console.log(updateObject.next);
        await LanguageService.updateWord(req.app.get('db'),req.language.id, currNodeCycle.value.id, updateObject.memory_value, updateObject.correct_count, updateObject.incorrect_count, updateObject.next);
        currNodeCycle = currNodeCycle.next;
      }
    }
    else {
      let next = words.find(item => item.id === head.next);
      let nextOriginal = next.original;

      head.memory_value *= 2;

      let newTotalScore = head.total_score + 1

      res.status(200).json({nextWord: nextOriginal, wordCorrectCount: next.correct_count, wordIncorrectCount: next.incorrect_count, totalScore: newTotalScore, answer: head.translation, isCorrect: true})

      //set database and linked list to new information:

      //totalscore - 1
      await LanguageService.updateScore(req.app.get('db'),req.language.id, newTotalScore);

      //incorrect count increase
      originalHead.value.correct_count = originalHead.value.correct_count + 1;
      originalHead.value.memory_value = originalHead.value.memory_value * 2;

      //head to next
      //old head to new position
      wordsLinkedList.head = wordsLinkedList.head.next;
      wordsLinkedList.insertAtOrLast(originalHead.value,head.memory_value)
      await LanguageService.updateHead(req.app.get('db'),req.language.id, head.next);


    // console.log('-------------linked list-->');
    // console.log(JSON.stringify(wordsLinkedList, null, 2));
      //update each word in the database
      let currNodeCycle = wordsLinkedList.head;
      while (currNodeCycle != null) {
        // console.log('------------------currNodeCycle-->');
        // console.log(currNodeCycle);
        let updateObject = {
          memory_value: currNodeCycle.value.memory_value,
          correct_count: currNodeCycle.value.correct_count,
          incorrect_count: currNodeCycle.value.incorrect_count,
          next: currNodeCycle.next != null ? currNodeCycle.next.value.id : null
        }
        // console.log(updateObject.memory_value);
        // console.log(updateObject.incorrect_count);
        // console.log(updateObject.next);
        await LanguageService.updateWord(req.app.get('db'),req.language.id, currNodeCycle.value.id, updateObject.memory_value, updateObject.correct_count, updateObject.incorrect_count, updateObject.next);
        currNodeCycle = currNodeCycle.next;
      }
    }
    next();
  }
  catch(error) {
    next(error);
  }
  })

module.exports = languageRouter
