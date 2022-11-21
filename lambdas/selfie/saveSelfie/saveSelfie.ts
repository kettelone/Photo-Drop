import 'dotenv/config';
import AWS from 'aws-sdk';
import { Selfie } from '../../../models/model';
// get reference to S3 client
const s3 = new AWS.S3();

const baseHandler = async (event: any) => {
  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const params = { Bucket: bucket, Key: key };

  try {
    const data = await s3.headObject(params).promise();
    const metadata = (!data) ? null : data.Metadata;

    if (metadata) {
      const { userid } = metadata;
      const urlSelfie = `https://${bucket}.s3.eu-west-1.amazonaws.com/${key}`;
      const oldSelfies = await Selfie.findAll({
        where: { appUserId: userid },
        order: [['createdAt', 'DESC']],
      });
      oldSelfies![0].active = false;
      await oldSelfies[0].save();
      await Selfie.create({
        name: key, selfieUrl: urlSelfie, active: true, appUserId: userid,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const handler = baseHandler;

module.exports.handler = handler;
