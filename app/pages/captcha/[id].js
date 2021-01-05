import Hcaptcha from "../../components/Hcaptcha";
import dbConnect from "../../utils/dbConnect";
import Captcha from "../../models/Captcha";
import { useState } from "react";

function Page({ sitekey, captcha }) {
  const [message, setMessage] = useState("");

  const handleVerificationSuccess = async (token) => {
    // TODO
    // Add virify endpoint to API https://docs.hcaptcha.com/
    // If token verified then update captcha object
    // And send notification in Telegram (with RabbitMQ)
    try {
      let res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token, captcha: captcha }),
      });

      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        throw new Error(res.status);
      }

      res = await res.json();

      console.log(res, captcha);
      if (res.success || process.env.NODE_ENV === "development") {
        // Send notification to Bot
        await fetch("/api/notify", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatId: captcha.groupId,
            userId: captcha.from.id,
            message: `<b>${captcha.from.first_name}</b> your captcha solved!`,
          }),
        });
        return setMessage("Captcha solved!");
      }
      setMessage(JSON.stringify(res, null, 2));
    } catch (error) {
      console.log(error);
      setMessage("Failed to verify");
    }
  };
  return (
    <div
      className="bg-fixed h-full"
      style={{
        backgroundImage: `url(
          "https://i.pinimg.com/originals/51/ed/c0/51edc046eb80046ee4755ee71d0f19ca.jpg"
        )`,
      }}
    >
      <div className="container mx-auto flex h-screen">
        <div className="md:w-1/4"></div>
        <div className="md:w-1/2">
          <div className="h-6"></div>
          <div className="bg-gray-200 p-8 text-center font-body bg-opacity-50 rounded-lg">
            <h1>Captcha Bot</h1>
            <p className="font-serif py-4">
              To remove restrictions please solve this captcha:
            </p>
            {process.env.NODE_ENV === "development" ? (
              <>
                <p className="font-bold">{JSON.stringify(captcha, null, 2)}</p>
                <button
                  onClick={() => handleVerificationSuccess("test_token_123")}
                >
                  Test verify
                </button>
              </>
            ) : (
              <></>
            )}
            <p>{message}</p>
          </div>

          <div className="p-8">
            <Hcaptcha
              sitekey={sitekey}
              theme="light"
              size="normal"
              onVerify={handleVerificationSuccess}
            />
          </div>

          <div className="bg-gray-200 h-1/4 font-thin text-center p-8 bg-opacity-50 rounded-lg">
            Banner
          </div>
        </div>
        <div className="md:w-1/4"></div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  // Fetch captcha object from MongoDB
  await dbConnect();
  const captcha = await Captcha.find({ id: context.params.id });

  console.log(captcha);
  console.log(process.env.NODE_ENV);
  if (!captcha[0]) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id: context.params.id,
      sitekey: process.env.ENV_LOCAL_HCAPTCHA_KEY,
      captcha: JSON.parse(JSON.stringify(captcha[0])),
    },
  };
}

export default Page;
