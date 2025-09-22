const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');
const r = require('convert-radix64');
const hasha = require("hasha");
const hashMap = {};

const config = {
    apiKey: "AIzaSyBAAUCZ8xXzS4r7jxMhlvPB6OzKIC0MRE8",
    authDomain: "urlshortner-b1883.firebaseapp.com",
    databaseURL: "https://urlshortner-b1883.firebaseio.com",
    storageBucket: "urlshortner-b1883.appspot.com",
};
const app = initializeApp(config);
const database = getDatabase(app);

module.exports = {
    shorten: (url) => {
        hash =  hasha(url, {encoding:"base64", algorithm:"md5"});
        hash = hash.slice(0,4);

        hash = hash.replace('/','-');
        hash = hash.replace('+','_');
        // let hashInt = parseInt(hash,16)
        // conv = atob(hashInt);
        hashMap[hash] = url;
        writeUserData(url,r.from64(hash),hash);

        return hash;

    },
    expand: (shortcode) => {

        return new Promise(function(resolve, reject){

            if(shortcode === undefined){
                reject(null);
            }
            const dbRef = ref(database, '/' + r.from64(shortcode));
            get(dbRef).then((snapshot) => {
                const val = snapshot.val();
                if (val) {
                    let url = val.url;
                    resolve(url);
                } else {
                    resolve(hashMap[shortcode]);
                }
            }).catch(reject);
                
        });
    }
};

writeUserData = (url, shortcode, code) => {
    set(ref(database, '/' + shortcode), {
        code: code,
        url: url
    });
}
