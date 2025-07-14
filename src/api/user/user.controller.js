// Bu dosyada rotalara gelen isteklerin asıl mantığı yer alacak.

exports.register = (req, res) => {
    res.status(200).send("Kayıt olma rotası çalışıyor.");
};

exports.login = (req, res) => {
    res.status(200).send("Giriş yapma rotası çalışıyor.");
};

exports.me = (req, res) => {
    res.status(200).send("Profil rotası çalışıyor.");
};