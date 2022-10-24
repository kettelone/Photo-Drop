interface PhotoObject {
      photoKey:string
}
interface PhotosArray {
    photographerId: string,
    albumId: string,
    photoName: string,
    'Content-Type':string
}

interface LoginBody {
    login: string,
    password: string
}

interface CreateAlbumBody {
    name: string,
    location: string,
    date: string,
    photographerId: string
}

interface GetThumbnailIconBody {
    albumId: string
}

export {
  PhotoObject, PhotosArray, LoginBody, CreateAlbumBody, GetThumbnailIconBody,
};
