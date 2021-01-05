module.exports = (id) => {
    let admins = process.env.ADMINS;
    admins = admins.split(",");
    if (admins.includes(id.toString())) {
        return true;
    }
};
