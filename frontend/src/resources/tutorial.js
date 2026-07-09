const slideText = {
    writeReview: {
        title: "Write reviews",
        sub: "Grab a nice meal, then rate the food, drinks, and ambience, and share your thoughts.",
    },
    sharing: {
        title: "Share with friends",
        sub: "Add friends to share your reviews, or post publicly to share with everyone.",
    },
    collaborative: {
        title: "Collaborative reviews",
        sub: "Invite others who ate with you to add their perspective in the same review.",
    },
    themes: {
        title: "Themes",
        sub: "Pick a theme. All your reviews will be styled to match, and you can change it whenever you like.",
    },
    lists: {
        title: "Lists",
        sub: "Create lists of your favourite restaurants, or ones you want to try. Enable checklist mode to tick them off as you go.",
    },
};

const specialUsers = (() => {
    try {
        return JSON.parse(import.meta.env.VITE_SPECIAL_USERS || "[]");
    } catch {
        return [];
    }
})();

const userSets = [
    [
        {
            initials: "AL",
            name: "A. Linguini",
            bg: "bg-orange-100",
            text: "text-orange-700",
        },
        {
            initials: "RR",
            name: "Remy R.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "AE",
            name: "Anton E.",
            bg: "bg-gray-100",
            text: "text-gray-700",
        },
    ],
    [
        {
            initials: "LS",
            name: "Luke S.",
            bg: "bg-green-100",
            text: "text-green-700",
        },
        {
            initials: "BK",
            name: "Ben K.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "CT",
            name: "C. Threepio",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
    ],
    [
        {
            initials: "EB",
            name: "E. Bennet",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
        {
            initials: "FD",
            name: "F. Darcy",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "GW",
            name: "G. Wickham",
            bg: "bg-red-100",
            text: "text-red-700",
        },
    ],
    [
        {
            initials: "VB",
            name: "Violet B.",
            bg: "bg-violet-100",
            text: "text-violet-700",
        },
        {
            initials: "VS",
            name: "Veruca S.",
            bg: "bg-red-100",
            text: "text-red-700",
        },
        {
            initials: "MT",
            name: "Mike T.",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
    ],
    [
        {
            initials: "FB",
            name: "Ferris B.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "CF",
            name: "Cameron F.",
            bg: "bg-red-100",
            text: "text-red-700",
        },
        {
            initials: "SP",
            name: "Sloane P.",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
    ],
    [
        {
            initials: "FJ",
            name: "Fred J.",
            bg: "bg-blue-100",
            text: "text-blue-700",
        },
        {
            initials: "VD",
            name: "Velma D.",
            bg: "bg-orange-100",
            text: "text-orange-700",
        },
        {
            initials: "NR",
            name: "Norville R.",
            bg: "bg-green-100",
            text: "text-green-700",
        },
    ],
    [
        {
            initials: "HS",
            name: "Homer S.",
            bg: "bg-yellow-100",
            text: "text-yellow-700",
        },
        {
            initials: "LL",
            name: "Lenny L.",
            bg: "bg-green-100",
            text: "text-green-700",
        },
        {
            initials: "CC",
            name: "Carl C.",
            bg: "bg-pink-100",
            text: "text-pink-700",
        },
    ],
];

const reviewCardExamples = [
    { text: "this meal was too hot.", rating: [2], theme: "tomato-sauce" },
    { text: "this meal was too cold.", rating: [1], theme: "kai-moana" },
    { text: "this meal was just right.", rating: [5], theme: "manuka-honey" },
    {
        text: "we've had one, yes, but what about second breakfast?",
        rating: [3],
        theme: "smashed-avo",
    },
    {
        text: "I don't like food, I love it. if I don't love it, I don't swallow.",
        rating: [1],
        theme: "blueberry-muffin",
    },
    {
        text: "I drink your milkshake! I drink it up!",
        rating: [5],
        theme: "flat-white",
    },
    {
        text: "do you know what they call the quarter pounder with cheese in france?",
        rating: [3],
        theme: "pav-lover",
    },
    {
        text: "po-tae-toes. boil em, mash em, stick em in a stew.",
        rating: [4],
        theme: "kumara-fries",
    },
    { text: "is butter a carb?", rating: [2], theme: "strawberry-wafer" },
];

const restaurantNameExamples = [
    "Chez Quis",
    "Dex's Diner",
    "Dorsia",
    "Gusteau's",
    "Los Pollos Hermanos",
    "Moe's Tavern",
    "Mos Eisley Cantina",
    "The Prancing Pony",
    "The Winchester",
];

const listSets = [
    {
        listName: "Fine Dining",
        restaurants: ["Chez Quis", "The Gilded Truffle", "Dorsia"],
    },
    {
        listName: "Animated Atmosphere",
        restaurants: ["Pizza Planet", "The Krusty Krab", "The Poison Apple"],
    },
    {
        listName: "For the Family Man",
        restaurants: ["Moe's Tavern", "The Drunken Clam", "Bob's Burgers"],
    },
    {
        listName: "Fast Food Spots",
        restaurants: [
            "Big Kahuna Burger",
            "Los Pollos Hermanos",
            "Cluckin' Bell",
        ],
    },
    {
        listName: "Worth the Trip",
        restaurants: ["Mos Eisley Cantina", "End Of Line Club", "Milliways"],
    },
];

export const tutorial = {
    slideText,
    randomUserSet: () => userSets[Math.floor(Math.random() * userSets.length)],
    randomRestaurantName: () =>
        restaurantNameExamples[
            Math.floor(Math.random() * restaurantNameExamples.length)
        ],
    getUserSetForEmail: (email) => {
        const specialUser = specialUsers.find((u) => u.email === email);
        if (!specialUser) return null;
        return (
            userSets.find(
                (set) => set[0].name === specialUser.defaultUserSet,
            ) ?? null
        );
    },
    getRestaurantNameForEmail: (email) => {
        const specialUser = specialUsers.find((u) => u.email === email);
        return specialUser?.defaultRestaurantName ?? null;
    },
    reviewCardExamples,
    reviewTextExample:
        "Really really good. Really really really good. So good.",
    reviewTextExampleCollaborator: "I agree, it was really good.",
    welcomeMessage: [
        "Welcome to two:top!",
        "Here's a quick tutorial to get you started.",
    ],
    nextUserSet: (currentSet) => {
        const currentIndex = userSets.findIndex(
            (set) => set[0].name === currentSet[0].name,
        );
        const nextIndex = (currentIndex + 1) % userSets.length;
        return userSets[nextIndex];
    },
    randomListSet: () => listSets[Math.floor(Math.random() * listSets.length)],
    getListSetForEmail: (email) => {
        const specialUser = specialUsers.find((u) => u.email === email);
        if (!specialUser) return null;
        return (
            listSets.find((s) => s.listName === specialUser.defaultListName) ??
            null
        );
    },
    setNameSlideHeading: "What's your name?",
    setNameSlideSubheading: "This is how you'll appear on your reviews.",
    setNameSlidePlaceholder: "e.g. Jamie",
    setNameSkip: "I'll do this later",
    editProfileHeading: "Edit Your Profile",
    editProfileSubheading:
        "Edit your name or add a profile photo at any time on your profile page.",
};
