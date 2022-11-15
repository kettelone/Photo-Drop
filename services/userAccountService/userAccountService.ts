import axios from 'axios';
import { Photo_Person, Photo } from '../../models/model';

class UserService {
  async findUniqueAlbumIds(personid: string) {
    const photo_person = await Photo_Person.findAll({ where: { personId: personid } });
    const promises = photo_person.map((record) => Photo.findOne({ where: { id: record.photoId } }));
    const photos = await Promise.all(promises);
    const albumIds = photos.map((photo) => photo?.albumId);
    const uniqueAlbumIds = [...new Set(albumIds)];
    return uniqueAlbumIds;
  }

  async sendNotification(phone: string, finalString:string) {
    const uri = encodeURI(`https://api.telegram.org/bot5620754624:AAECaxHAR6n5ITV14KjCpP-JPGCrFKcCRjY/sendMessage?chat_id=-678774504&text=PhotoDrop:${phone} your photos have dropped🔥\n\nCheck them out here:\n ${finalString}`);
    await axios({ method: 'get', url: uri });
  }
}

export default new UserService();
