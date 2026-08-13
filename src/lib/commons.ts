/* ============================================================
   WIKIMEDIA COMMONS — Jung Kook photo library.
   All 36 photos are freely licensed (CC BY / CC BY-SA) and
   hosted on Wikimedia Commons. We use the official
   Special:FilePath redirect, which always serves the file.

   Source: commons.wikimedia.org — photographers credited there.
   ============================================================ */

export const wm = (name: string, width = 640) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=${width}`;

export interface JKPhoto {
  file: string;
  title: string;
}

export const JK_PHOTOS: JKPhoto[] = [
  { file: "160217_Gaon_Chart_K-POP_Awards_Jungkook_01.jpg", title: "Gaon Awards" },
  { file: "160217_Gaon_Chart_K-POP_Awards_Red_Carpet_BTS_Jungkook.jpg", title: "Red Carpet" },
  { file: "Jeon_Jung-kook_at_8th_Melon_Music_Awards_01.jpg", title: "Melon Music Awards" },
  { file: "Jeon_Jung-kook_at_a_fansigning_in_Mok-dong,_Yangcheon-gu,_Seoul,_12_May_2016.jpg", title: "Fansign Day" },
  { file: "Jeon_Jung-kook_at_Power_of_K_concert,_24_April_2016_01.jpg", title: "Power of K" },
  { file: "Jeon_Jung-kook_at_Power_of_K_concert,_24_April_2016_02.jpg", title: "Power of K ✦" },
  { file: "Jeon_Jung-kook_at_Sapporo_K-pop_Festival,_6_February_2016_01.jpg", title: "Sapporo Festival" },
  { file: "Jeon_Jung-kook_at_Sapporo_K-pop_Festival,_6_February_2016_02.jpg", title: "Sapporo ✦" },
  { file: "Jeon_Jung-kook_at_Sapporo_K-pop_Festival,_6_February_2016_03.jpg", title: "Sapporo Stage" },
  { file: "Jeon_Jung-kook_during_The_Most_Beautiful_Moment_in_Life_On_Stage_Epilogue_in_Manila,_30_July_2016_03.jpg", title: "HYYH Epilogue" },
  { file: "1117_Jungkook_(BTS)_Dispatch_Photo_Shoot_LA_(1).png", title: "Dispatch LA" },
  { file: "1117_Jungkook_(BTS)_Dispatch_Photo_Shoot_LA_(2).png", title: "LA Golden Days" },
  { file: "170529_Jungkook_at_a_press_conference_for_the_BBMAs_(1).png", title: "BBMAs Press" },
  { file: "170529_Jungkook_at_a_press_conference_for_the_BBMAs_(2).png", title: "BBMAs 2017" },
  { file: "Jeon_Jung-kook_at_a_fanmeet_in_Myeongdong_on_February_24,_2017_(cropped).jpg", title: "Fanmeet Smiles" },
  { file: "Jeon_Jung-kook_at_Global_VLive_Top_10,_24_January_2017.png", title: "VLive Top 10" },
  { file: "Jeon_Jung-kook_at_the_31st_Golden_Disk_Awards_01.jpg", title: "Golden Disk Awards" },
  { file: "Jeon_Jung-kook_at_The_Wings_Tour_in_Manila_01.png", title: "WINGS Tour" },
  { file: "Jeon_Jung-kook_at_The_Wings_Tour_in_Manila_02.png", title: "WINGS ✦" },
  { file: "Jeon_Jung-kook_at_The_Wings_Tour_in_Manila_04.png", title: "WINGS Manila" },
  { file: "Jeon_Jung-kook_at_The_Wings_Tour_in_Manila_07.png", title: "WINGS Finale" },
  { file: "180524_Jungkook_at_a_press_conference_for_Love_Yourself_Tear_(1).png", title: "Love Yourself: Tear" },
  { file: "180524_Jungkook_at_a_press_conference_for_Love_Yourself_Tear_(2).png", title: "LY Press Day" },
  { file: "180622_Jungkook_performing_Mic_Drop_at_Lotte_Family_Festival.png", title: "Mic Drop Stage" },
  { file: "181016_Jungkook_performing_Euphoria_in_Berlin_(1).png", title: "Euphoria in Berlin" },
  { file: "181016_Jungkook_performing_Euphoria_in_Berlin_(2).png", title: "Euphoria ✦" },
  { file: "181016_Jungkook_performing_Euphoria_in_Berlin_(3).png", title: "Euphoria Stage" },
  { file: "181128_2018_Asia_Artist_Awards_Jungkook.png", title: "Asia Artist Awards" },
  { file: "Jeon_Jung-kook_during_Love_Yourself_tour_in_Los_Angeles,_8_September_2018_01.jpg", title: "Love Yourself LA" },
  { file: "Jeon_Jung-kook_during_Love_Yourself_tour_in_Los_Angeles,_8_September_2018_02.jpg", title: "LA Stadium Night" },
  { file: "Jeon_Jung-kook_performing_\"Euphoria\"_during_the_Love_Yourself_tour_in_Canada,_22_September_2018_08.jpg", title: "Euphoria in Canada" },
  { file: "Jeon_Jung-kook_performing_\"Fake_Love\"_during_Love_Yourself_tour_in_Berlin,_16_October_2018_02.jpg", title: "Fake Love Stage" },
  { file: "Jeon_Jung-kook_at_\"Map_of_the_Soul_-_Persona\"_global_press_conference,_17_April_2019.jpg", title: "MOTS: Persona" },
  { file: "Jeon_Jung-kook_at_BBMAs,_1_May_2019_01.jpg", title: "BBMAs 2019" },
  { file: "Jeon_Jung-kook_at_Golden_Disk_Awards,_5_January_2019_01.jpg", title: "Golden Disk 2019" },
  { file: "Jeon_Jung-kook_performing_\"Euphoria\"_during_Speak_Yourself_tour_at_Rose_Bowl,_Pasadena,_5_May_2019_01.jpg", title: "Rose Bowl Euphoria" },
];

/* the stage photo used as the site-wide ambient backdrop */
export const BACKDROP_FILE =
  "Jeon_Jung-kook_performing_\"Euphoria\"_during_Speak_Yourself_tour_at_Rose_Bowl,_Pasadena,_5_May_2019_01.jpg";
