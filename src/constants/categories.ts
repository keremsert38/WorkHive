export interface Category {
    id: string;
    name: string;
    icon: string;
    subCategories: string[];
}

export const CATEGORIES: Category[] = [
    {
        id: 'graphic_design',
        name: 'Grafik & Tasarım',
        icon: '🎨',
        subCategories: ['Logo Tasarımı', 'Kurumsal Kimlik', 'Web Tasarım', 'Broşür & Katalog', 'Sosyal Medya', 'İllüstrasyon', 'NFT Sanatı']
    },
    {
        id: 'software',
        name: 'Yazılım & Teknoloji',
        icon: '</>',
        subCategories: ['Web Yazılım', 'Mobil Uygulama', 'Masaüstü Yazılım', 'Oyun Geliştirme', 'Veri Analizi', 'Yapay Zeka', 'Siber Güvenlik']
    },
    {
        id: 'writing',
        name: 'Yazı & Çeviri',
        icon: '📝',
        subCategories: ['İçerik Yazarlığı', 'Çeviri', 'Editörlük', 'Senaryo', 'Blog Yazıları', 'Metin Yazarlığı', 'Özgeçmiş & CV']
    },
    {
        id: 'marketing',
        name: 'Dijital Pazarlama',
        icon: '📢',
        subCategories: ['SEO', 'Sosyal Medya Yönetimi', 'Google Ads', 'E-posta Pazarlama', 'Influencer', 'İçerik Stratejisi']
    },
    {
        id: 'video_animation',
        name: 'Video & Animasyon',
        icon: '🎬',
        subCategories: ['Video Kurgu', 'Tanıtım Filmi', 'Logo Animasyonu', '3D Animasyon', 'Altyazı & Dublaj']
    },
    {
        id: 'music_audio',
        name: 'Müzik & Ses',
        icon: '🎵',
        subCategories: ['Seslendirme', 'Mix & Mastering', 'Ses Efektleri', 'Şarkı Sözü Yazarlığı', 'Jingle']
    },
    {
        id: 'consulting',
        name: 'Danışmanlık',
        icon: '💡',
        subCategories: ['İş Planı', 'Kariyer Danışmanlığı', 'Hukuk Danışmanlığı', 'Finansal Danışmanlık', 'E-ticaret Danışmanlığı']
    }
];
