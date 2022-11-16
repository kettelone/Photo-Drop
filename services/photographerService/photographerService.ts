import aws from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { Photo } from '../../models/model';
import { PhotosArray } from '../../controllers/photographerController/interfaces';

aws.config.update({
  region: 'eu-west-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4', // It fixes the issue of "Missing Authentication Token" when generating presignedUrl for Object lambda Access Point
});

const s3 = new aws.S3();

class PhotographerService {
  generatePresignedPost(photosArray:PhotosArray[][], people:string[]) {
    const presignedPostsArray = photosArray.map((photo) => {
      const { photographerId } = photo[0];
      const { albumId } = photo[1];
      const { photoName } = photo[2];
      const startIndex = photoName.lastIndexOf('.') + 1;
      const photoExtension = photoName.substr(startIndex).toLowerCase();
      const { url, fields } = s3.createPresignedPost({
        Fields: {
          key: `${uuidv4()}.${photoExtension}`,
          'Content-Type': `image/${photoExtension}`,
          'Content-Disposition': `attachment;filename=${photoName}`,
          'x-amz-meta-people': `${people}`,
          'x-amz-meta-photographerId': photographerId,
          'x-amz-meta-albumId': albumId,
          originalPhotoKey: photoName,
        },
        Conditions: [['content-length-range', 0, 15000000], ['starts-with', '$Content-Type', 'image/']],
        Expires: 60 * 60, // seconds
        Bucket: process.env.S3_BUCKET_ORIGINAL,
      });
      return { url, fields };
    });
    return presignedPostsArray;
  }

  generatePresignedGet(PhotoKeys :{ photoKey: string }[]) {
    const photoUrls = PhotoKeys.map((el) => {
      const url = s3.getSignedUrl('getObject', {
        Bucket: process.env.S3_BUCKET_ORIGINAL,
        Key: el.photoKey,
        Expires: 60 * 60,
      });
      return url;
    });
    return photoUrls;
  }

  async getAlbumThumbnails(albumIds:string[]) {
    const albumThumbnails: { [key: string]: string | null } = {};
    const promises = albumIds.map((albumId) => Photo.findOne({ where: { albumId } }));
    const albumIcons = await Promise.all(promises);

    // find icon for the not empty albums
    albumIds.forEach((albumId) => {
      albumIcons.forEach((icon) => {
        if (icon && albumId === icon!.albumId) {
          const url = s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_LAMBDA_ACCESS_POINT_IMAGE_RESIZE,
            Key: icon.name,
            Expires: 60 * 120,
          });
          albumThumbnails[icon.albumId] = url;
        }
      });
    });

    // assign albumThumbnails as null for empty albums
    albumIds.forEach((id) => {
      if (!albumThumbnails[id]) {
        albumThumbnails[id] = null;
      }
    });
    return albumThumbnails;
  }
}

export default new PhotographerService();
