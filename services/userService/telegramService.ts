import axios from 'axios'

class telegramService {
	async sendNotification(phone: string, finalString: string) {
		const uri = encodeURI(
			`https://api.telegram.org/bot5620754624:AAECaxHAR6n5ITV14KjCpP-JPGCrFKcCRjY/sendMessage?chat_id=-678774504&text=PhotoDrop:${phone} your photos have dropped🔥\n\nCheck them out here:\n ${finalString}`
		)
		await axios({ method: 'get', url: uri })
	}
}

export default new telegramService()
