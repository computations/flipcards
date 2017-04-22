var card_model = require('./models/modelCard');
var media_model = require('./models/modelMedia');
var deck_model = require('./models/modelDeck');
var crypto = require('crypto');
var fs = require('fs');

exports.get_all_cards = function(req, res, next){
    console.log("getting all cards");
    card_model.find(function(err, docs){
        if(err) return next(err);
        return res.send(docs);
    });
    //next(); //Creates error 
}

exports.index = function(req, res){
    console.log("connection from " + req.ip);
    res.sendFile('public/html/index.html', {"root":__dirname})
};

var CARD_KEYS = ['media']

exports.get_cards = function(req, res){
    console.log("connection from " + req.ip);
    card_model.findOne({_id: req.params.id}, function(err, cards){
        if(err) return console.log(err);
        res.send(cards);
    });
};

exports.upload_file = function(req,res){
    var file_type = req.file.mimetype.split('/')[0]
    var new_dir = 'static/'+file_type+'/';
    if(!fs.existsSync(new_dir)){
        fs.mkdirSync(new_dir);
    }
    var hash = crypto.createHash('sha256')
    var hashed_file = hash.update(fs.readFileSync(req.file.path)).digest('hex');
    var filename=new_dir + hashed_file;
    if(!fs.existsSync(filename)){
        fs.rename(req.file.path, filename, function(){
            res.send({'url': filename, 'media_type': file_type});
        });
    }
    else{
        fs.unlink(req.file.path, () => {
            res.send({'url': filename, 'media_type': file_type});
        });
    }
};
 
/*
 * request object:
 * {
 *     media: [
 *        {
 *           type: _____,
 *           url: _____,
 *        }, ... 
 *     ]
 * }
 */
exports.create_card = function(req, res, next){
    var media_list =[];
    console.log(req.body)
    for(var m of req.body.media){
        media_list.push( new media_model(m));
    }
    new_title=req.body.title;
    new_desc = req.body.description;
    console.log("requested media list");
    console.log(media_list)
    var new_card = new card_model({media:media_list, title:new_title, 
        description:new_desc});
    new_card.save((err) =>{
        if(err){
            console.log(err);
        }
    });
    console.log(new_card._id);
    res.send(new_card._id);
    next();
};

exports.update_card = function(req, res, next){
    var update_card = {}
    if(req.body.media){
        update_card.media = [];
        for(var m of req.body.media){
            media_list.push(new media_model(m));
        }
    }
    if(req.body.title){
        update_card.title=req.body.title;
    }
    if(req.body.description){
        update_card.description = req.body.description;
    }
    card_model.update({_id:req.body.card} update_card, null, 
            (err, num) => { if(err){console.log(err);} });
}

exports.get_decks = function(req, res, next){
    card_model.find().distinct('decks', function(err, cols){
        if(err){
            console.log(err);
        }
        res.send(cols);
    });
}

exports.get_deck = function(req, res){
    deck_id = req.params.deck 
    card_model.find({'decks._id': deck_id}, function(err, cards){
        if(err){
            console.log(err);
        }
        res.send(cards);
    });
}

exports.create_deck = function(req, res){
    var new_deck = new deck_model({title: req.body.title, desc: req.body.desc, 
        imgUrl: req.body.imgUrl});
    new_deck.save(function(error, deck, n){
        card_model.findByIdAndUpdate(
                req.body.cards,
                {$push: {"decks": deck}},
                {safe: true, upsert:true},
                function(err, _){
                    console.log(deck._id);
                    res.send(deck._id);
                }
        );
    });
}

exports.add_cards_to_deck = function(req, res){
    deck_id = req.params.deck;
    new_cards = req.body.cards;
    deck_model.find({'_id' : deck_id}, (err, deck, n) => {
        if(deck.length == 1){
            card_model.findByIdAndUpdate(
                {'_id': {$in: new_cards}},
                {$push: {"decks": deck_id}},
                {safe: true, upsert:true},
                (err, _) => {
                    if(err){
                        console.log(err);
                    }
                });
            }
        }
    );
}
