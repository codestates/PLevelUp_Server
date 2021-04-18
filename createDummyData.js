import Club from './models/club';
import Master from './models/master';
import bcrypt from 'bcrypt';

export async function createDefaultMaster() {
  const hashedPassword = await bcrypt.hash('12341234', 10);

  const master = await Master.create({
    email: 'tester@carrot.com',
    username: '테스터 유저',
    password: hashedPassword,
  });
  return master.dataValues.id;
}

export async function createDummyClubData(masterId) {
  const clubs = [...Array(100).keys()].map(i => ({
    title: `스타트업DNA${i + 1}`,
    summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
    place: '온라인',
    price: 50000,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    topic:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    startDate: '2021-04-07 14:20:09.168',
    endDate: '2021-04-07 14:20:09.168',
    day: '금',
    limitUserNumber: 6,
    MasterId: masterId,
    coverUrl: '/img/sampleDummyCoverUrl.png',
    isBookmark: false,
  }));
  await Club.bulkCreate(clubs);
}
export async function createDummyClubDataForTest(masterId) {
  const clubs = [
    {
      title: `(new)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '온라인',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      topic:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-18 11:20:09.168',
      endDate: '2021-04-30 14:20:09.168',
      day: '금',
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: '/img/sampleDummyCoverUrl.png',
      isBookmark: false,
    },
    {
      title: `(마감임박)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '온라인',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      topic:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-07 14:20:09.168',
      endDate: '2021-04-22 11:20:09.168',
      day: '금',
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: '/img/sampleDummyCoverUrl.png',
      isBookmark: false,
    },
    {
      title: `(normal)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '강남',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      topic:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-07 14:20:09.168',
      endDate: '2021-04-30 14:20:09.168',
      day: '목',
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: '/img/sampleDummyCoverUrl.png',
      isBookmark: false,
    },
    {
      title: `(place)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '홍대',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      topic:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-26 14:20:09.168',
      endDate: '2021-04-30 14:20:09.168',
      day: '수',
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: '/img/sampleDummyCoverUrl.png',
      isBookmark: false,
    },
  ];
  await Club.bulkCreate(clubs);
}
