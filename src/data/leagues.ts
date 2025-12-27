export interface League {
  id: string;
  name: string;
  logo: string;
  apiUrl: string;
  hasGroups?: boolean;
}

export const leagues: League[] = [
  {
    id: 'afcon',
    name: 'AFCON 2025',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:44.png/v11/Competitions/light/167',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=15&competitions=167',
    hasGroups: true
  },
  {
    id: 'ligue1Mobilis',
    name: 'Ligue 1 Mobilis',
    logo: 'https://images.fotmob.com/image_resources/logo/leaguelogo/516.png',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=15&competitions=560'
  },
  {
    id: 'premierLeague',
    name: 'Premier League',
    logo: 'https://sportslogohistory.com/wp-content/uploads/2020/04/Premier_League_pres.png',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=15&competitions=7'
  },
  {
    id: 'serieA',
    name: 'Serie A',
    logo: 'https://cdn.shopify.com/s/files/1/1131/1046/files/Untitled-8_480x480.png?v=1627961519',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=17'
  },
  {
    id: 'laLiga',
    name: 'La Liga',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:2.png/v5/Competitions/light/11',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=15&competitions=11'
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:4.png/v2/Competitions/light/25',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=15&competitions=25'
  },
  {
    id: 'ligue1',
    name: 'Ligue 1',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:5.png/v5/Competitions/light/57',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=57'
  },
  {
    id: 'eredivisie',
    name: 'Eredivisie',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:5.png/v5/Competitions/light/35',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=35'
  },
  {
    id: 'ucl',
    name: 'Champions League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v5/Competitions/light/572',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=572'
  },
  {
    id: 'uel',
    name: 'Europa League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v8/Competitions/light/573',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=573'
  },
  {
    id: 'cl',
    name: 'Conference League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:19.png/v6/Competitions/light/7685',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=7685'
  },
  {
    id: 'egyptianLeague',
    name: 'Egyptian Premier League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:131.png/v12/Competitions/light/552',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=552'
  },
  {
    id: 'botolaPro',
    name: 'Botola Pro',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:127.png/v4/Competitions/light/557',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=557'
  },
  {
    id: 'tunisiaLeague',
    name: 'Tunisia Ligue 1',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:135.png/v1/Competitions/light/554',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=554'
  },
  {
    id: 'saudiLeague',
    name: 'Saudi League',
    logo: 'https://imagecache.365scores.com/image/upload/f_png,w_68,h_68,c_limit,q_auto:eco,dpr_2,d_Countries:Round:122.png/v9/Competitions/light/649',
    apiUrl: 'https://webws.365scores.com/web/standings/?langId=1&competitions=649'
  }
];
