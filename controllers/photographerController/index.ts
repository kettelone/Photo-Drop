interface PhotoObject {
      photoKey:string
}
interface PhotosArray {
    photographerId: number,
    albumId: number,
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
    photographerId: number
}

interface GetThumbnailIconBody {
    albumId: number
}

export {
  PhotoObject, PhotosArray, LoginBody, CreateAlbumBody, GetThumbnailIconBody,
};
