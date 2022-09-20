interface PhotoObject {
      photoKey:string
}
interface PhotosArray {
    photographerId: number,
    albumId: number,
    photoName: string,
    'Content-Type':string
}

export { PhotoObject, PhotosArray };
