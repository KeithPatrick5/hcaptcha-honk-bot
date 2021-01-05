import dbConnect from "../../utils/dbConnect";
import Captcha from "../../models/Captcha";

export default async (req, res) => {
  const {
    body: { token, captcha },
    method,
  } = req;

  console.log("token", token);

  try {
    let verifRes = await fetch(
      `https://hcaptcha.com/siteverify?response=${token}&secret=${process.env.ENV_LOCAL_HCAPTCHA_SECRET}`,
      {
        method: "POST",
      }
    );

    verifRes = await verifRes.json();
    console.log("verifRes", verifRes);

    if (process.env.NODE_ENV === "production" && !verifRes.success) {
      res.statusCode = 200;
      return res.json(verifRes);
    }

    // Update captcha.status = 'solved' on mongoDB
    await dbConnect();
    captcha.status = "SOLVED";
    const updCaptcha = await Captcha.findByIdAndUpdate(captcha._id, captcha, {
      new: true,
      runValidators: true,
    });
    console.log(updCaptcha);
    res.statusCode = 200;
    res.json({ success: true, result: "Ok" });
  } catch (error) {
    console.log(error);
    res.statusCode = 404;
    res.json({ success: false, result: error.message });
  }
};
