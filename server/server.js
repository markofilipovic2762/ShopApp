const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const formidable = require('express-formidable');
const cloudinary = require('cloudinary');
const mailer = require('nodemailer');
const SHA1 = require('crypto-js/sha1');
const path = require('path');
const moment = require('moment');

const app = express();
const mongoose = require('mongoose');
const async = require('async');
require('dotenv').config();

//mongoose setup
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

//body and cookie parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

//          MODELS           //
const { User } = require('./models/user');
const { Brand } = require('./models/brand');
const { Wood } = require('./models/wood');
const { Product } = require('./models/product');
const { Payment } = require('./models/payment');
const { Site } = require('./models/site');

//   MIDDLEWARES    //
const { auth } = require('./middleware/auth');
const { admin } = require('./middleware/admin');

// U T I L S
const { sendEmail } = require('./utils/mail/index');

// const date =  new Date();
// const po = `PO-${date.getSeconds()}${date.getMilliseconds}-${SHA1("2142141441ghgjjjfjj")
// .toString().substring(0,8)}`

// const smtpTransport = mailer.createTransport({
//     service: "Gmail",
//     auth: {
//         user:"markofilipovicsd@gmail.com",
//         pass: "milicija996"
//     }
// });

// var mail = {
//     from: "ShopApp <markofilipovicsd@gmail.com",
//     to: "simeonfilipovic@gmail.com",
//     subject: "Send test email",
//     text: "Testing our app mails",
//     html: "<b> Ovo radiii </b>"
// }

// smtpTransport.sendMail(mail,(err,res)=> {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log('email sent');
//     }
//     smtpTransport.close();
// })

const multer = require('multer');
let storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'uploads/')
    },
    filename: (req,file,cb) => {
        cb(null,`${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req,file,cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.png'){
            return cb(res.status(400).end('only jpg and png is allowed '),false)
        }

        cb(null,true);
    }
});
const upload = multer({ storage: storage }).single("file");

app.post('/api/users/uploadfile',auth,admin, (req, res)=> {
    upload(req,res,(err)=>{
        if(err) return res.json({success: false, err});
        return res.json({success:true})
    })
} )

const fs = require('fs');

app.get('/api/users/admin_files',auth,admin, (req, res)=> {
    const dir = path.resolve(".")+'/uploads/';
    fs.readdir(dir,(err,items)=>{
        return res.status(200).send(items);
    })
})

app.get('/api/users/download/:id',auth, admin, (req, res)=> {
    const file = path.resolve(".")+`/uploads/${req.params.id}`;
    res.download(file);
})

//  P   R   O   D   U   C   T   S   //
app.post('/api/product/shop', (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key]
            }
        }
    }

    findArgs['publish'] = true;

    Product.
        find(findArgs).
        populate('brand').
        populate('wood').
        sort([[sortBy, order]]).
        skip(skip).
        limit(limit).
        exec((err, articles) => {
            if (err) return res.status(400).send(err);
            res.status(200).json({
                size: articles.length,
                articles
            })
        })
})

// BY ARRIVAL
// /articles?sortBy=createdAt&order=desc&limit=4

// BY SELL
// articles?sortBy=SOLD&order=desc&limit=4
app.get('/api/product/articles', (req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 100;

    Product.find().
        populate('brand').
        populate('wood').
        sort([[sortBy, order]]).
        limit(limit).
        exec((err, articles) => {
            if (err) return res.status(400).send(err);
            res.send(articles);
        })

})

//...article?id=haw89hh2wdhwahdhwdhiodh,daghwdhwihdiowhdj,dwiahdahodihwodh&type=single
app.get('/api/product/articles_by_id', (req, res) => {
    let type = req.query.type;
    let items = req.query.id;

    if (type === "array") {
        let ids = req.query.id.split(',');
        items = [];
        items = ids.map(item => {
            return mongoose.Types.ObjectId(item)
        })
    }

    Product.
        find({ '_id': { $in: items } }).
        populate('brand').
        populate('wood').
        exec((err, docs) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send(docs)
        })
})

app.post('/api/product/article', auth, admin, (req, res) => {
    const product = new Product(req.body);

    product.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            article: doc
        })
    })
})

//  W   O   O   D   S   //

app.post('/api/product/wood', auth, admin, (req, res) => {
    const wood = new Wood(req.body);

    wood.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            wood: doc
        })
    })
});

app.get('/api/product/woods', (req, res) => {
    Wood.find({}, (err, woods) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(woods)
    })
})

//  B   R   A   N   D   //
app.post('/api/product/brand', auth, admin, (req, res) => {
    const brand = new Brand(req.body);

    brand.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            brand: doc
        })
    })
})

app.get('/api/product/brands', (req, res) => {
    Brand.find({}, (err, brands) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(brands)
    })
})


//  U   S   E   R   S   //

app.post('/api/users/reset_user',(req, res)=>{
    User.findOne(
        {'email':req.body.email},
        (err,user)=> {
            user.generateResetToken((err,user)=>{
                if(err) return res.json({ success: false, err });
                sendEmail(user.email,user.name,null,"reset_password",user)
                return res.json({success:true})
            })
        }
    )
})

app.post('/api/users/reset_password',(req, res)=>{
    var today = moment().startOf('day').valueOf();

    User.findOne({
        resetToken: req.body.resetToken,
        resetTokenExp: {
            $gte: today
        }
    },(err,user)=>{
        if(!user) return res.json({success:false, message:'Sorry token is bad, generate new one'});

        user.password = req.body.password;
        user.resetToken = '';
        user.resetTokenExp = '';

        user.save((err, doc)=> {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({
                success: true
            })
        })
    })
})

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        cart: req.user.cart,
        history: req.user.history
    })
})

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        sendEmail(doc.email,doc.name,null,"welcome")
        res.status(200).json({
            success: true,
            //userdata: doc
        })
    })
});

app.post('/api/users/login', (req, res) => {
    //find the email
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: 'Auth failed,email not found' });
        //check password
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({ loginSuccess: false, message: 'Wrong password' });
            //generate a token
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie('w_auth', user.token).status(200).json({
                    loginSuccess: true
                })
            })
        })
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },
        { token: '' },
        (err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        }
    )
});

app.post('/api/users/uploadimage', auth, admin, formidable(), (req, res) => {
    cloudinary.uploader.upload(req.files.file.path, (result) => {
        console.log(result);
        res.status(200).send({
            public_id: result.public_id,
            url: result.url
        })
    }, {
        public_id: `${Date.now()}`,
        resource_type: 'auto'
    })
})

app.get('/api/users/removeimage', auth, admin, (req, res) => {
    let image_id = req.query.public_id;

    cloudinary.uploader.destroy(image_id, (error, result) => {
        if (error) return res.json({ success: false, error });
        res.status(200).send('ok');
    })
})

app.post('/api/users/addToCart', auth, (req, res) => {

    User.findOne({ _id: req.user._id }, (err, doc) => {
        let duplicate = false;

        doc.cart.forEach(item => {
            if (item.id == req.query.productId) {
                duplicate = true;
            }
        })

        doc.cart.indexOf(req.query.productId) > 0 ?
            duplicate = true
            : null;

        console.log(doc.cart);
        console.log(duplicate);
        console.log(req.query.productId);

        if (duplicate) {
            User.findOneAndUpdate(
                { _id: req.user._id, "cart.id": mongoose.Types.ObjectId(req.query.productId) },
                { $inc: { "cart.$.quantity": 1 } },
                { new: true },
                (err, doc) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(doc.cart)
                } // ispitaj ovo
            )
        } else {
            User.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: {
                        cart: {
                            id: mongoose.Types.ObjectId(req.query.productId),
                            quantity: 1,
                            date: Date.now()
                        }
                    }
                },
                { new: true },
                (err, doc) => {
                    if (err) return res.json({ success: false, err });
                    res.status(200).json(doc.cart)
                }
            )
        }

    })
})

app.get('/api/users/removeFromCart', auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            "$pull":
                { "cart": { "id": mongoose.Types.ObjectId(req.query._id) } }
        },
        { new: true },
        (err, doc) => {
            let cart = doc.cart;
            let array = cart.map(item => {
                return mongoose.Types.ObjectId(item.id)
            });

            Product.
                find({ '_id': { $in: array } }).
                populate('brand').
                populate('wood').
                exec((err, cartDetail) => {
                    if (err) return res.status(400).send(err);
                    return res.status(200).json({
                        cartDetail,
                        cart
                    })
                })
        }
    )
})

app.post('/api/users/successBuy', auth, (req, res) => {
    let history = [];
    let transactionData = {};
    const date = new Date();
    const po = `PO-${date.getSeconds()}${date.getMilliseconds()}-${SHA1(req.user._id)
    .toString().substring(0,8)}`;

    //user history
    req.body.cartDetail.forEach(item => {
        history.push({
            porder: po,
            dateOfPurchase: Date.now(),
            name: item.name,
            brand: item.brand.name,
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
        })
    })
    // Payments dash
    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        lastname: req.user.lastname,
        email: req.user.email,
    }
    transactionData.data = {
        ...req.body.paymentData,
        porder: po
    } ;
    transactionData.product = history;

    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $push: {
                history: history
            },
            $set: {
                cart: []
            }
        },
        { new: true },
        (err,user)=>{
            if(err) return res.json({ success: false, err });

            const payment = new Payment(transactionData);
            payment.save((err,doc)=>{
                if(err) return res.json({success: false,err});
                let products = [];
                doc.product.forEach( item=> {
                    products.push({id: item.id,quantity: item.quantity})
                } )
                
                async.eachSeries(products,(item,callback)=> {
                    Product.update(
                        {_id: item.id},
                        { $inc : {
                            "sold": item.quantity
                        }},
                        { new:false },
                        callback
                    )
                },(err)=> {
                    if(err) return res.json({ success: false, err });
                    // send the mail
                    sendEmail(user.email,user.name,null,"purchase",transactionData)
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: []
                    })
                } )
            })
        }
    )
    //
})

app.post('/api/users/update_profile',auth,(req, res)=> {
    
    User.findOneAndUpdate(
        {_id: req.user._id},
        { 
            "$set": req.body
        },
        { new: true},
        (err,doc)=> {
            if(err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        }
    );
});

//  S I T E   //
app.get('/api/site/site_data',(req, res)=> {
    Site.find({},(err,site)=> {
        if(err) return res.status(400).send(err);
        res.status(200).send(site[0].siteInfo)
    });
});

app.post('/api/site/site_data',auth,admin,(req,res)=>{
    Site.findOneAndUpdate(
        { name: 'Site' },
        { "$set": { siteInfo: req.body } },
        { new: true},
        (err,doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true,
                siteInfo: doc.siteInfo
            })
        }
    )
})

const port = process.env.PORT || 3002;

app.listen(port, () => {
    console.log(`Server running at ${port}`);
})