const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    let response = db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id });
    return response;
  },

  getHead(db, language_id) {
    let response = db.raw('select * from word join language on language.head = word.id where word.language_id=?',language_id)
    .then(rows => {
      return rows.rows[0];
    })
    return response;
  },
  
  updateWord(db, language_id, word_id, memory_value, correct_count, incorrect_count, next) {
    let response = db('word').where({language_id: language_id, word_id: word_id}).update({memory_value: memory_value, correct_count: correct_count, incorrect_count: incorrect_count, next: next});
    return response;
  },

  updateScore(db, language_id, totalScore) {
    let response = db('language').where({language_id: language_id}).update({total_score: totalScore})
    return response;
  },

  updateHead(db, language_id, head) {
    let response = db('language').where({language_id: language_id}).update({head: head});
    return response;
  }
}

module.exports = LanguageService
