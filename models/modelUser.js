var Schema = require('mongoose').Schema

var history_schema = Schema({
    card: {type:Schema.ObjectId,required:true},
    correct_dates: [{type:Date, default: Date.now}],
    num_correct: {type: Number, default: 0}
});

var user_schema = Schema({
    user_id: {type:String, required: true, unique:true},
    display_name: {type:String, required:true},
    card_history: [history_schema]
});

var user = db.model('users',user_schema);


module.exports = user

module.exports.upsert_user = (profile, cb) => {
    console.log(profile);
    var query = {'user_id' : profile.id, display_name: profile.displayName};
    user.findOneAndUpdate(query, query, {upsert: true}, (err, user) => {
        if(err){console.log(err);}
        else{cb(null, user);}
    });
};
