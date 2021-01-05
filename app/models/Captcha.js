import mongoose from 'mongoose'

/* CaptchaSchema will correspond to a collection in your MongoDB database. */
const CaptchaSchema = new mongoose.Schema({
    id: { type: String },
    groupId: { type: String },
    userId: { type: String },
    status: { type: String },
}, { timestamps: true })

export default mongoose.models.Captcha || mongoose.model('Captcha', CaptchaSchema)