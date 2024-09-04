const express = require('express');
const fs = require('fs');
const url = require('url');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const cloudinary=require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const session = require('express-session');
cloudinary.config({
    cloud_name:'dmyrvncq8',
    api_key:127992323956988,
    api_secret:'WLynI5CD4DrDXVoYvHgBuVFGcLc',
  });
const custommodule = require('./realprodcustom.js');
const custommodule2 = require('./raelsingleprodcustom.js');

const client1 = new MongoClient('mongodb+srv://garlapatidhatrinaresh:Supriya987@cluster0.wcqxqxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const usersCollection = client1.db('credentials').collection('users');
const productsenglish = client1.db('credentials').collection('productsenglish');
const adminCollection = client1.db('credentials').collection('admins');

//const storage = multer.memoryStorage();
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "file-uploads",
      format: async (req, file) => "png", //convert all images to png
      public_id: (req, file) => file.fieldname + "_" + Date.now(),
      transformation: [
        {
          width: 800,
          height: 600,
          crop: "fill",
        },
      ],
    },
  });
const upload = multer({ storage: storage }).fields([{ name: 'images[]', maxCount: 20 }]);

const connectTodataBase = async () => {
    try {
        await client1.connect();
        console.log('MongoDB connected');
    } catch (err) {
        console.error("Cannot connect to database", err);
        throw err; // Re-throw the error after logging
    }
};

connectTodataBase(); // Connect to database once at the start

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: '9618', // Replace with your own secret key
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 } // For development; set to true in production with HTTPS
}));

const mainpage = fs.readFileSync('./homepage.html');
const payment = fs.readFileSync('./payment.html', 'utf-8');
const trackorder = fs.readFileSync('./trackorder.html', 'utf-8');
const html = fs.readFileSync('./index3.html', 'utf-8');
const producthtml = fs.readFileSync('./realestateproducts.html', 'utf-8');
const singleprodhtml = fs.readFileSync('./realestatesingleprod.html', 'utf-8');
const login = fs.readFileSync('./login2.html', 'utf-8');
const signup = fs.readFileSync('./signup.html', 'utf-8');
const adminhtml = fs.readFileSync('./admin.html', 'utf-8');
const adminsignuphtml = fs.readFileSync('./adminsignup.html', 'utf-8');
const additems = fs.readFileSync('./additems.html', 'utf-8');

const authenticate = (req, res, next) => {
    if (req.session && req.session.username) {
        return next();
    } else {
        res.redirect('/login.html');
    }
};

const authenticate1 = (req, res, next) => {
    if (req.session && req.session.username1) {
        return next();
    } else {
        res.redirect('/admin.html');
    }
};

app.get('/', (req, res) => {
    const userdata1 = req.cookies.user;
    if (userdata1) {
        const username3 = JSON.parse(userdata1).username;
        if (username3) {
            req.session.username = username3;
            return res.redirect('/products');
        }
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(login);
    res.end();
});

app.get('/logout', (req, res) => {
    //res.clearCookie('user');
    res.redirect('/login.html');
});

app.get('/login.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(login);
    res.end();
});

app.get('/signup.html', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(signup);
    res.end();
});

app.get('/admin.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(adminhtml);
    res.end();
});

app.get('/adminsignup.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(adminsignuphtml);
    res.end();
});

app.get('/payment.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(payment);
    res.end();
});

app.get('/additems.html', authenticate1, (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(additems);
    res.end();
});

app.get('/paynow.html', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.write(trackorder);
    res.end();
});

app.post('/additems.html', upload, async (req, res) => {
    try {
        const images1 = req.files['images[]'].map(file => ({
            filename: file.originalname,
            contentType: file.mimetype,
            data: file.buffer.toString('base64')
        }));

        const data = {
            category: req.body.category,
            name: req.body.name,
            price: req.body.price,
            area: req.body.area,
            length: req.body.length,
            breadth: req.body.breadth,
            shape: req.body.shape,
            soilcolor: req.body.soilcolor,
            type1: req.body.type1,
            specifications: req.body.specifications,
            location: req.body.location,
            pincode: req.body.pincode,
            phonenumber: req.body.phonenumber,
            description: req.body.description,
            images: images1
        };

        const result = await productsenglish.insertOne(data);
        if (result.acknowledged) {
            res.redirect('/');
        } else {
            res.status(500).send('Error adding item to the database');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while adding the item');
    }
});

app.post('/signup', async (req, res) => {
    try {
        const check = await usersCollection.findOne({ name: req.body.username });
        if (check && check.password === req.body.password) {
            res.redirect('/signup.html?signupFailure=true');
        } else {
            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            const data = {
               
                name: req.body.username,
                password: hashedpassword,
                phonenumber: req.body.phonenumber
            };
            const temp = await usersCollection.insertOne(data);
            console.log(temp);
            res.redirect('/signup.html?signupSuccess=true');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during signup');
    }
});

app.post('/adminsignup', async (req, res) => {
    try {
        const check = await adminCollection.findOne({ name: req.body.username });
        if (check && check.password === req.body.password) {
            res.redirect('/adminsignup.html?adminsignupFailure=true');
        } else {
            const hashedpassword = await bcrypt.hash(req.body.password, 10);
            const data = {
                name: req.body.username,
                password: hashedpassword,
                phonenumber: req.body.phonenumber
            };
            const temp = await adminCollection.insertOne(data);
            console.log(temp);
            res.redirect('/adminsignup.html?adminsignupSuccess=true');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during admin signup');
    }
});

app.post('/login', async (req, res) => {
    try {
        const check = await usersCollection.findOne({ name: req.body.username });
        if (check && await bcrypt.compare(req.body.password,check.password)) {
            req.session.username = req.body.username;
            res.cookie('user', JSON.stringify(check), {
                maxAge: 900000,
                httpOnly: true,
                secure: false,
                sameSite: 'Strict'
            });
            res.redirect('/products');
        } else {
            res.redirect('/login.html?loginFailure=true');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/login.html?loginFailure=true');
    }
});

app.post('/admin', async (req, res) => {
    try {
        const check = await adminCollection.findOne({ name: req.body.username });
        if (check && check.password === req.body.password) {
            req.session.username1 = req.body.username;
            res.redirect('/additems.html');
        } else {
            res.redirect('/admin.html?adminFailure=true');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/admin.html?adminFailure=true');
    }
});

app.get('/about', authenticate, (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html.replace('{{%CONTENT%}}', 'you are in About page'));
});

app.get('/contact', authenticate, (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html.replace('{{%CONTENT%}}', 'you are in Contact page'));
});

app.get('/products', authenticate, async (req, res) => {
    try {
        let productjson = await productsenglish.find().toArray();
        let producthtmlArray = productjson.map(prod => custommodule.htmlreplace(producthtml, prod));

        if (!req.query.id) {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(html.replace('{{%CONTENT%}}', producthtmlArray.join('')));
        } else {
            let product = await productsenglish.findOne({ _id: new ObjectId(req.query.id) });
            let singleProdHtml = custommodule2.htmlreplace(singleprodhtml, product);
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
            res.end(html.replace('{{%CONTENT%}}', singleProdHtml));
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving products');
    }
});

app.use((req, res) => {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html.replace('{{%CONTENT%}}', 'Page not found'));
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
