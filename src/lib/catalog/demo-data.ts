export type DemoOffer = {
  id: string;
  marketplace: string;
  title: string;
  url: string;
  price: number | null;
  currency: string;
  rating: number | null;
  review_count: number | null;
  delivery_text: string;
  availability: string;
};

export type DemoProduct = {
  id: string;
  canonical_name: string;
  brand: string;
  category: string;
  description: string;
  image_url: string;
  ai_summary: string;
  is_active: boolean;
  product_offers: DemoOffer[];
};

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "prod-1",
    canonical_name: "Быстросборная 3-местная палатка MirCamping",
    brand: "MirCamping",
    category: "Палатки и кемпинг",
    description:
      "Автоматическая кемпинговая палатка с быстрой установкой за 45 секунд. Двухслойная конструкция, влагозащита тента 3000 мм, дна 5000 мм. Вентиляционные окна с противомоскитными сетками, удобный чехол-сумка в комплекте.",
    image_url:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: 92% реальных отзывов покупателей. Главные плюсы — действительно мгновенная сборка и герметичные швы. Оптимальный выбор для спонтанных выездов на природу.",
    is_active: true,
    product_offers: [
      {
        id: "off-1",
        marketplace: "Ozon",
        title: "Палатка MirCamping 3-местная быстросборная автомат",
        url: "https://ozon.ru",
        price: 7450,
        currency: "RUB",
        rating: 4.8,
        review_count: 342,
        delivery_text: "Сегодня до 21:00",
        availability: "В наличии",
      },
      {
        id: "off-2",
        marketplace: "Wildberries",
        title: "MirCamping кемпинговая 3-местная палатка автомат",
        url: "https://wildberries.ru",
        price: 7890,
        currency: "RUB",
        rating: 4.7,
        review_count: 215,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-2",
    canonical_name: "Экспедиционная палатка Tramp Mountain 3 v2",
    brand: "Tramp",
    category: "Палатки и кемпинг",
    description:
      "Экспедиционная всесезонная палатка с внешним каркасом из дюрапола. Снежная юбка по всему периметру, два тамбура, два входа. Устойчива к штормовому ветру и сильным осадкам.",
    image_url:
      "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: 98% подтверждённых покупателей. 0% жалоб на производственный брак за последние 6 месяцев. Рекомендована для сложных походов и низких температур.",
    is_active: true,
    product_offers: [
      {
        id: "off-3",
        marketplace: "Ozon",
        title: "Tramp Mountain 3 v2 палатка экспедиционная трехместная",
        url: "https://ozon.ru",
        price: 14890,
        currency: "RUB",
        rating: 4.9,
        review_count: 189,
        delivery_text: "Послезавтра",
        availability: "В наличии",
      },
      {
        id: "off-4",
        marketplace: "Яндекс Маркет",
        title: "Палатка Tramp Mountain 3 v2, зеленый",
        url: "https://market.yandex.ru",
        price: 15490,
        currency: "RUB",
        rating: 4.9,
        review_count: 94,
        delivery_text: "3 дня",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-3",
    canonical_name: "Кемпинговая палатка Trek Planet",
    brand: "Trek Planet",
    category: "Палатки и кемпинг",
    description:
      "Надежная трехместная палатка классической купольной формы. Простой монтаж на двух дугах из фибергласа. Внутренние карманы для мелочей, подвес для фонаря, москитная сетка на входе.",
    image_url:
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Исторический ценовой минимум за 90 дней. Лучшее соотношение цена/качество в бюджетном сегменте. Честные отзывы без накруток.",
    is_active: true,
    product_offers: [
      {
        id: "off-5",
        marketplace: "Wildberries",
        title: "Палатка кемпинговая 3-местная Trek Planet Boston",
        url: "https://wildberries.ru",
        price: 4120,
        currency: "RUB",
        rating: 4.6,
        review_count: 512,
        delivery_text: "2 дня",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-4",
    canonical_name: "Детский игровой домик-палатка «Лесная сказка»",
    brand: "Лесная сказка",
    category: "Товары для детей",
    description:
      "Детский игровой вигвам из 100% гипоаллергенного хлопка с натуральными опорами из массива бука. В комплекте мягкий коврик с нескользящей основой, флажки и текстильная корзина для игрушек.",
    image_url:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Безопасность материалов подтверждена сертификатами. Ткань стирается при 30°C без усадки. Родители отмечают высокую прочность опор.",
    is_active: true,
    product_offers: [
      {
        id: "off-6",
        marketplace: "Wildberries",
        title: "Вигвам детский игровой домик Лесная сказка с ковриком",
        url: "https://wildberries.ru",
        price: 2890,
        currency: "RUB",
        rating: 4.8,
        review_count: 730,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-5",
    canonical_name: "Беспроводные наушники Sony WH-1000XM5",
    brand: "Sony",
    category: "Электроника",
    description:
      "Флагманские полноразмерные наушники с лучшим на рынке активным шумоподавлением. 8 микрофонов, 30 часов автономной работы, поддержка кодека LDAC Hi-Res Audio, быстрая зарядка через USB-C.",
    image_url:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: 96% позитивных оценок качества звука и шумоподавления. Эксперты отмечают комфортную посадку при длительном ношении.",
    is_active: true,
    product_offers: [
      {
        id: "off-7",
        marketplace: "Ozon",
        title: "Sony WH-1000XM5 полноразмерные беспроводные наушники Black",
        url: "https://ozon.ru",
        price: 32490,
        currency: "RUB",
        rating: 4.9,
        review_count: 840,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
      {
        id: "off-8",
        marketplace: "Яндекс Маркет",
        title: "Беспроводные наушники Sony WH-1000XM5, черный",
        url: "https://market.yandex.ru",
        price: 33990,
        currency: "RUB",
        rating: 4.8,
        review_count: 412,
        delivery_text: "Сегодня",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-6",
    canonical_name: "Умная колонка Яндекс Станция Миди с Zigbee",
    brand: "Яндекс",
    category: "Электроника",
    description:
      "Компактная колонка с голосовым помощником Алиса, LED-дисплеем с часами и встроенным хабом управления умным домом Zigbee. Мощность звука 24 Вт с технологией Room Correction.",
    image_url:
      "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Лидер продаж в категории умных колонок с экраном. Быстрый отклик Zigbee-устройств даже при временном отсутствии интернета.",
    is_active: true,
    product_offers: [
      {
        id: "off-9",
        marketplace: "Яндекс Маркет",
        title: "Умная колонка Яндекс Станция Миди с Алисой и Zigbee, черный",
        url: "https://market.yandex.ru",
        price: 13990,
        currency: "RUB",
        rating: 4.9,
        review_count: 1420,
        delivery_text: "Сегодня курьером",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-7",
    canonical_name: "Робот-пылесос Roborock S8 Pro Ultra",
    brand: "Roborock",
    category: "Бытовая техника",
    description:
      "Премиальный робот-пылесос с многофункциональной станцией самоочистки. Влажная уборка с ультразвуковой вибрацией VibraRise 2.0, мощность всасывания 6000 Па, распознавание препятствий Reactive 3D.",
    image_url:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Самый низкий процент гарантийных обращений в премиум-сегменте. Станция моет и сушит салфетки горячим воздухом.",
    is_active: true,
    product_offers: [
      {
        id: "off-10",
        marketplace: "Ozon",
        title: "Робот-пылесос Roborock S8 Pro Ultra со станцией самоочистки White",
        url: "https://ozon.ru",
        price: 89990,
        currency: "RUB",
        rating: 4.9,
        review_count: 260,
        delivery_text: "Послезавтра",
        availability: "В наличии",
      },
      {
        id: "off-11",
        marketplace: "Wildberries",
        title: "Roborock S8 Pro Ultra моющий робот пылесос",
        url: "https://wildberries.ru",
        price: 92490,
        currency: "RUB",
        rating: 4.8,
        review_count: 110,
        delivery_text: "3 дня",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-8",
    canonical_name: "Кофемашина автоматическая DeLonghi Magnifica S",
    brand: "DeLonghi",
    category: "Бытовая техника",
    description:
      "Классическая автоматическая зерновая кофемашина с ручным капучинатором. Стальные жернова с 13 степенями помола, давление помпы 15 бар, регулировка крепости и объема порции.",
    image_url:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: «Рабочая лошадка» с высокой ремонтопригодностью и доступностью оригинальных расходников. Стабильная плотная пенка.",
    is_active: true,
    product_offers: [
      {
        id: "off-12",
        marketplace: "Ozon",
        title: "Кофемашина De'Longhi Magnifica S ECAM 22.110.B",
        url: "https://ozon.ru",
        price: 34990,
        currency: "RUB",
        rating: 4.8,
        review_count: 3100,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
      {
        id: "off-13",
        marketplace: "Яндекс Маркет",
        title: "Кофемашина De Longhi Magnifica S ECAM 22.110.SB, серебристый",
        url: "https://market.yandex.ru",
        price: 35900,
        currency: "RUB",
        rating: 4.8,
        review_count: 1980,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-9",
    canonical_name: "Аэрогриль Xiaomi Smart Air Fryer Pro 4L",
    brand: "Xiaomi",
    category: "Бытовая техника",
    description:
      "Умный аэрогриль с прозрачным смотровым окном и объемом чаши 4 литра. Температурный диапазон от 40°C до 200°C, управление через приложение Mi Home, поддержка голосового управления.",
    image_url:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Отличное качество антипригарного покрытия, равномерная циркуляция воздуха без подгорания. Удобный мониторинг через окно.",
    is_active: true,
    product_offers: [
      {
        id: "off-14",
        marketplace: "Wildberries",
        title: "Аэрогриль умный Xiaomi Smart Air Fryer Pro 4L",
        url: "https://wildberries.ru",
        price: 6990,
        currency: "RUB",
        rating: 4.7,
        review_count: 890,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-10",
    canonical_name: "Фитнес-браслет Xiaomi Smart Band 9",
    brand: "Xiaomi",
    category: "Электроника",
    description:
      "Яркий AMOLED-экран 1.62 дюйма с частотой обновления 60 Гц и пиковой яркостью 1200 нит. До 21 дня автономности, более 150 спортивных режимов, точный мониторинг пульса и SpO2.",
    image_url:
      "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Точность шагомера и датчиков пульса улучшена на 16% по сравнению с предыдущим поколением. Превосходная читаемость на солнце.",
    is_active: true,
    product_offers: [
      {
        id: "off-15",
        marketplace: "Wildberries",
        title: "Фитнес-браслет Xiaomi Smart Band 9 Midnight Black",
        url: "https://wildberries.ru",
        price: 3590,
        currency: "RUB",
        rating: 4.8,
        review_count: 1540,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-11",
    canonical_name: "Термос Stanley Classic 1.4L",
    brand: "Stanley",
    category: "Спорт и отдых",
    description:
      "Легендарный вакуумный термос из нержавеющей стали 18/8 с двойными стенками. Сохраняет горячие напитки до 40 часов, холодные — до 35 часов, лед — до 6 дней. Пожизненная гарантия от производителя.",
    image_url:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: 99% оригинальных проверенных отзывов. Неубиваемый корпус с порошковой окраской Hammertone, крышка используется как чашка.",
    is_active: true,
    product_offers: [
      {
        id: "off-16",
        marketplace: "Ozon",
        title: "Термос Stanley Classic Vacuum Bottle 1.4L Hammertone Green",
        url: "https://ozon.ru",
        price: 6490,
        currency: "RUB",
        rating: 4.9,
        review_count: 670,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-12",
    canonical_name: "Рюкзак городской Thule Subterra 25L",
    brand: "Thule",
    category: "Спорт и отдых",
    description:
      "Прочный технологичный городской рюкзак с защитным отделением SafeEdge для ноутбука до 15.6 дюймов и планшета. Продуманный органайзер PowerPocket для зарядных устройств и кабелей.",
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Высокая износостойкость нейлона 800D. Водоотталкивающая пропитка защищает электронику даже при сильном дожде.",
    is_active: true,
    product_offers: [
      {
        id: "off-17",
        marketplace: "Ozon",
        title: "Рюкзак для ноутбука Thule Subterra 25L Dark Shadow",
        url: "https://ozon.ru",
        price: 11990,
        currency: "RUB",
        rating: 4.9,
        review_count: 220,
        delivery_text: "Послезавтра",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-13",
    canonical_name: "Sennheiser Momentum 4 Wireless",
    brand: "Sennheiser",
    category: "Электроника",
    description:
      "Премиальные аудиофильские беспроводные наушники с рекордной автономностью до 60 часов. Адаптивное гибридное шумоподавление, фирменные 42-мм излучатели, поддержка aptX Adaptive.",
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Анти-Фейк 98%. Исторически лучшая цена за 90 дней. Лучшая детализация в среднем и высоком регистре частот. 99% рекомендаций покупателей.",
    is_active: true,
    product_offers: [
      {
        id: "off-18",
        marketplace: "Ozon",
        title: "Беспроводные наушники Sennheiser Momentum 4 Wireless Black",
        url: "https://ozon.ru",
        price: 32990,
        currency: "RUB",
        rating: 4.9,
        review_count: 512,
        delivery_text: "Завтра",
        availability: "В наличии",
      },
      {
        id: "off-19",
        marketplace: "Яндекс Маркет",
        title: "Наушники полноразмерные Sennheiser Momentum 4 Wireless",
        url: "https://market.yandex.ru",
        price: 34990,
        currency: "RUB",
        rating: 4.9,
        review_count: 280,
        delivery_text: "Сегодня",
        availability: "В наличии",
      },
      {
        id: "off-20",
        marketplace: "Wildberries",
        title: "Sennheiser Momentum 4 Wireless черные",
        url: "https://wildberries.ru",
        price: 36490,
        currency: "RUB",
        rating: 4.8,
        review_count: 190,
        delivery_text: "2 дня",
        availability: "В наличии",
      },
    ],
  },
  {
    id: "prod-14",
    canonical_name: "Bowers & Wilkins Px8",
    brand: "Bowers & Wilkins",
    category: "Электроника",
    description:
      "Флагманские беспроводные наушники класса люкс. Корпус из литого алюминия, отделка тончайшей кожей наппа, карбоновые диффузоры 40 мм под наклоном для сверхточной сцены.",
    image_url:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    ai_summary:
      "ИИ-анализ: Анти-Фейк 91%. Премиум материалы и бескомпромиссное звучание. Проверена подлинность партии у авторизованного дистрибьютора.",
    is_active: true,
    product_offers: [
      {
        id: "off-21",
        marketplace: "Ozon",
        title: "Наушники беспроводные Bowers & Wilkins Px8 Royal Burgundy/Gold",
        url: "https://ozon.ru",
        price: 65990,
        currency: "RUB",
        rating: 4.9,
        review_count: 140,
        delivery_text: "Послезавтра",
        availability: "В наличии",
      },
      {
        id: "off-22",
        marketplace: "Яндекс Маркет",
        title: "Bowers & Wilkins Px8 флагманские наушники",
        url: "https://market.yandex.ru",
        price: 69990,
        currency: "RUB",
        rating: 4.8,
        review_count: 85,
        delivery_text: "3 дня",
        availability: "В наличии",
      },
    ],
  },
];

export function getDemoProductById(id: string): DemoProduct | null {
  return DEMO_PRODUCTS.find((p) => p.id === id) ?? null;
}
