import Club from './models/club';
import Master from './models/master';
import bcrypt from 'bcrypt';
import { SERVER_HOST } from './app';
import { getDayOfWeek } from './common/utils';

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
  const clubs1 = [...Array(15).keys()].map(i => ({
    title: `스타트업DNA${i + 1}`,
    summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
    place: '온라인',
    price: 50000,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    startDate: '2021-04-07',
    times: 12,
    day: getDayOfWeek('2021-04-07'),
    limitUserNumber: 6,
    MasterId: masterId,
    coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
  }));

  const clubs2 = [...Array(15).keys()].map(i => ({
    title: `강남의 강남${i + 1}`,
    summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
    place: '강남',
    price: 50000,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    startDate: '2021-04-22',
    times: 4,
    day: getDayOfWeek('2021-04-22'),
    limitUserNumber: 4,
    MasterId: masterId,
    coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
  }));
  const clubs3 = [...Array(15).keys()].map(i => ({
    title: `증권가의 여의도${i + 1}`,
    summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
    place: '여의도',
    price: 50000,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    startDate: '2021-04-22',
    times: 6,
    day: getDayOfWeek('2021-04-22'),
    limitUserNumber: 10,
    MasterId: masterId,
    coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
  }));
  const clubs4 = [...Array(15).keys()].map(i => ({
    title: `개발의 판교${i + 1}`,
    summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
    place: '판교',
    price: 50000,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    startDate: '2021-04-22',
    times: 20,
    day: getDayOfWeek('2021-04-22'),
    limitUserNumber: 5,
    MasterId: masterId,
    coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
  }));
  await Club.bulkCreate(clubs1);
  await Club.bulkCreate(clubs2);
  await Club.bulkCreate(clubs3);
  await Club.bulkCreate(clubs4);
}

export async function createDummyClubDataForTest(masterId) {
  const clubs = [
    {
      title: `(new)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '강남',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-18',
      times: 6,
      day: getDayOfWeek('2021-04-18'),
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
    },
    {
      title: `(마감임박)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '온라인',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-07',
      times: 8,
      day: getDayOfWeek('2021-04-07'),
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
    },
    {
      title: `(normal)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '강남',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-07',
      times: 10,
      day: getDayOfWeek('2021-04-07'),
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
    },
    {
      title: `(place)스타트업DNA`,
      summary: '스타트업에서 빠르게 성장하는 사람들의 비밀',
      place: '여의도',
      price: 50000,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      startDate: '2021-04-26',
      times: 1,
      day: getDayOfWeek('2021-04-26'),
      limitUserNumber: 6,
      MasterId: masterId,
      coverUrl: `${SERVER_HOST}/img/sampleDummyCoverUrl.png`,
    },
  ];
  await Club.bulkCreate(clubs);
}
