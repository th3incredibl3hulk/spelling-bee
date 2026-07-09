const app = document.getElementById("app");

const state = {
  children: [],
  themes: [],
  grades: [],
  selectedChild: null,
  selectedGrade: 2,
  selectedThemeId: "storybook",
  mode: "practice",
  session: null,
  currentIndex: 0,
  feedback: null,
  status: "",
  dashboard: null,
  words: [],
  wordFilter: "",
  wordDraft: null,
  currentAudio: null
};

const THEME_TREATMENTS = {
  storybook: {
    className: "theme-storybook",
    scene: "Book Nook",
    tagline: "Open books, bookmark trails, dragon tales, and final-chapter victories.",
    cardLine: "Paper trails and page pops",
    props: ["PAGE", "STAR", "MAP", "INK", "TALE"],
    missProps: ["ERASE", "NOTE", "TRY"],
    correctMessages: ["Page turned.", "Bookmark earned.", "Chapter clear."],
    missMessages: ["Margin note added.", "Revise the line.", "The page stays open."],
    brandLogo: "/assets/storybook/storybook-wordmark.svg",
    brandMark: "/assets/storybook/book-emblem.svg",
    stageImages: [
      "/assets/storybook/curated/library-banner.jpg",
      "/assets/storybook/curated/fairy-castle-banner.jpg"
    ],
    flyImages: [
      "/assets/storybook/book-emblem.svg",
      "/assets/storybook/chapter-checkpoint.svg",
      "/assets/storybook/curated/alice-illustration.png",
      "/assets/storybook/curated/oz-illustration.png",
      "/assets/storybook/curated/dragon-banner.svg"
    ],
    missImages: [
      "/assets/storybook/margin-note-reset.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/storybook/bookmark-selfie.svg",
        title: "Page turn unlocked",
        text: "Five correct answers in this run. Bookmark energy."
      },
      {
        threshold: 7,
        image: "/assets/storybook/chapter-checkpoint.svg",
        title: "Chapter checkpoint",
        text: "Seven correct answers. The story trunk lane is open."
      },
      {
        threshold: 8,
        image: "/assets/storybook/curated/dragon-banner.svg",
        title: "Dragon tale bonus",
        text: "Eight correct answers. The dragon is cheering."
      },
      {
        threshold: 10,
        image: "/assets/storybook/final-chapter-victory.svg",
        title: "Final chapter",
        text: "Perfect 10. That is author-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/storybook/chapter-checkpoint.svg",
        title: "Chapter saved",
        text: "The story run keeps moving."
      },
      {
        image: "/assets/storybook/margin-note-reset.svg",
        title: "Margin note found",
        text: "Friendly reset bonus. Keep going."
      },
      {
        image: "/assets/storybook/bookmark-selfie.svg",
        title: "Bookmark photobomb",
        text: "A quick page snap crashed the spelling round."
      },
      {
        image: "/assets/storybook/curated/enchanted-forest-banner.svg",
        title: "Forest drop",
        text: "The enchanted forest showed up for that spelling win."
      },
      {
        image: "/assets/storybook/curated/castle-tower-banner.svg",
        title: "Castle tower found",
        text: "A fairy-tale tower card popped in. Keep the run moving."
      },
      {
        image: "/assets/storybook/curated/library-banner.jpg",
        title: "Library shelf bonus",
        text: "The old book bindings are still glowing."
      }
    ],
    missMoments: [
      {
        image: "/assets/storybook/margin-note-reset.svg",
        title: "Margin note reset",
        text: "Not scary. Just a pencil note back to the chapter."
      }
    ],
    crateImage: "/assets/storybook/story-trunk-crate.svg",
    sideImage: "/assets/storybook/curated/dragon-banner.svg",
    sideLabel: "Dragon tale",
    sideTitle: "Story watch"
  },
  blockworks: {
    className: "theme-blockworks",
    scene: "BlockWorks",
    tagline: "A chunky build plate with obby rails and bouncing parts.",
    cardLine: "Blocks bounce into place",
    props: ["BRICK", "CUBE", "OBBY", "COIN", "XP"],
    missProps: ["RESET", "RAMP", "TRY"],
    correctMessages: ["Build piece locked.", "Checkpoint claimed.", "Stack upgraded."],
    missMessages: ["Respawn marker set.", "Platform reset.", "One block to rebuild."],
    brandLogo: "/assets/blockworks/Roblox_Wordmark_White.svg",
    brandMark: "/assets/blockworks/Roblox_Tilt_White.svg",
    stageImages: [
      "/assets/blockworks/curated/community-roblox-reference.jpg",
      "/assets/blockworks/curated/99-nights-banner-1.png"
    ],
    flyImages: [
      "/assets/blockworks/Roblox_Tilt_White.svg",
      "/assets/blockworks/obby-checkpoint.svg",
      "/assets/blockworks/curated/community-roblox-reference.jpg",
      "/assets/blockworks/curated/99-nights-banner-1.png",
      "/assets/blockworks/curated/doors-banner-2.png"
    ],
    missImages: [
      "/assets/blockworks/doors-lite.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/blockworks/blockworks-selfie.svg",
        title: "Selfie unlocked",
        text: "Five correct answers in this run. Screenshot energy."
      },
      {
        threshold: 7,
        image: "/assets/blockworks/obby-checkpoint.svg",
        title: "Checkpoint reached",
        text: "Seven correct answers. The mystery crate lane is open."
      },
      {
        threshold: 8,
        image: "/assets/blockworks/curated/99-nights-banner-1.png",
        title: "Campfire bonus",
        text: "Eight correct answers. The 99 Nights camp is watching the streak."
      },
      {
        threshold: 10,
        image: "/assets/blockworks/server-victory.svg",
        title: "Server victory",
        text: "Perfect 10. That is admin-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/blockworks/obby-checkpoint.svg",
        title: "Checkpoint saved",
        text: "The obby run keeps moving."
      },
      {
        image: "/assets/blockworks/doors-lite.svg",
        title: "Door 5 cleared",
        text: "Friendly hallway bonus. Keep going."
      },
      {
        image: "/assets/blockworks/blockworks-selfie.svg",
        title: "Avatar photobomb",
        text: "A quick selfie crashed the spelling round."
      },
      {
        image: "/assets/blockworks/curated/community-roblox-reference.jpg",
        title: "Crew photo drop",
        text: "The whole squad showed up for that spelling win."
      },
      {
        image: "/assets/blockworks/curated/doors-banner-2.png",
        title: "Lobby door found",
        text: "A calm DOORS lobby popped in. Keep the run moving."
      },
      {
        image: "/assets/blockworks/curated/99-nights-banner-1.png",
        title: "Campfire bonus",
        text: "The 99 Nights campfire is still lit."
      }
    ],
    missMoments: [
      {
        image: "/assets/blockworks/doors-lite.svg",
        title: "Respawn room",
        text: "Not scary. Just a checkpoint reset."
      }
    ],
    crateImage: "/assets/blockworks/mystery-crate.svg",
    sideImage: "/assets/blockworks/curated/99-nights-banner-1.png",
    sideLabel: "Surprise drop",
    sideTitle: "Campfire watch"
  },
  "mario-course": {
    className: "theme-mario-course",
    scene: "Course Start",
    tagline: "Pipes, coin blocks, flagpoles, hill hops, and checkpoint flags.",
    cardLine: "Coins pop and flags rise",
    props: ["COIN", "PIPE", "FLAG", "JUMP", "STAR"],
    missProps: ["BUMP", "MISS", "TRY"],
    correctMessages: ["Coin collected.", "Flagpole climbed.", "Checkpoint cleared."],
    missMessages: ["Back to the pipe.", "Try another jump.", "Checkpoint reset."],
    brandLogo: "/assets/mario-course/Mario_Series_Logo.svg",
    brandMark: "/assets/mario-course/Mario_emblem.svg",
    stageImages: [
      "/assets/mario-course/curated/odyssey-banner.png",
      "/assets/mario-course/curated/smb-world-banner.png"
    ],
    flyImages: [
      "/assets/mario-course/Mario_emblem.svg",
      "/assets/mario-course/star-power.svg",
      "/assets/mario-course/curated/odyssey-banner.png",
      "/assets/mario-course/curated/smb-world-banner.png",
      "/assets/mario-course/curated/wonder-banner.svg"
    ],
    missImages: [
      "/assets/mario-course/pipe-reset.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/mario-course/course-selfie.svg",
        title: "Jump shot unlocked",
        text: "Five correct answers in this run. Photo-finish energy."
      },
      {
        threshold: 7,
        image: "/assets/mario-course/star-power.svg",
        title: "Star power reached",
        text: "Seven correct answers. The ? block crate lane is open."
      },
      {
        threshold: 8,
        image: "/assets/mario-course/curated/wonder-banner.svg",
        title: "Wonder hills bonus",
        text: "Eight correct answers. The wonder-flower hills are cheering."
      },
      {
        threshold: 10,
        image: "/assets/mario-course/course-victory.svg",
        title: "Course clear",
        text: "Perfect 10. That is flagpole-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/mario-course/star-power.svg",
        title: "Star power saved",
        text: "The course run keeps moving."
      },
      {
        image: "/assets/mario-course/pipe-reset.svg",
        title: "Pipe checkpoint",
        text: "Friendly warp-pipe bonus. Keep going."
      },
      {
        image: "/assets/mario-course/course-selfie.svg",
        title: "Jump-shot photobomb",
        text: "A quick jump-shot crashed the spelling round."
      },
      {
        image: "/assets/mario-course/curated/odyssey-banner.png",
        title: "Odyssey capture drop",
        text: "A bright capture moment showed up for that spelling win."
      },
      {
        image: "/assets/mario-course/curated/kart-banner.svg",
        title: "Rainbow run found",
        text: "A rainbow-road kart card popped in. Keep the run moving."
      },
      {
        image: "/assets/mario-course/curated/wonder-banner.svg",
        title: "Wonder hills bonus",
        text: "The wonder-flower hills are still glowing."
      }
    ],
    missMoments: [
      {
        image: "/assets/mario-course/pipe-reset.svg",
        title: "Pipe reset",
        text: "Not scary. Just a checkpoint back to the pipe."
      }
    ],
    crateImage: "/assets/mario-course/mystery-question-block.svg",
    sideImage: "/assets/mario-course/curated/odyssey-banner.png",
    sideLabel: "Surprise coin",
    sideTitle: "Odyssey watch"
  },
  "space-cadets": {
    className: "theme-space-cadets",
    scene: "Drop Zone",
    tagline: "Orbital strikes, stratagems, extraction drops, and Super Earth callouts.",
    cardLine: "Orbital sweeps and stratagem pulls",
    props: ["ORBIT", "DROP", "SQUAD", "LIBERTY", "STRATAGEM"],
    missProps: ["SCAN", "RETRY", "SIGNAL"],
    correctMessages: ["Mission objective secured.", "Liberty defended.", "Stratagem approved."],
    missMessages: ["Extraction recalibrating.", "Mission log updated.", "Target spelling marked."],
    brandLogo: "/assets/space-cadets/helldivers-wordmark.svg",
    brandMark: "/assets/space-cadets/super-earth-emblem.svg",
    stageImages: [
      "/assets/space-cadets/curated/gameplay-banner.jpg",
      "/assets/space-cadets/curated/oppression-poster.webp"
    ],
    flyImages: [
      "/assets/space-cadets/super-earth-emblem.svg",
      "/assets/space-cadets/orbital-strike.svg",
      "/assets/space-cadets/curated/gameplay-banner.jpg",
      "/assets/space-cadets/curated/oppression-poster.webp",
      "/assets/space-cadets/curated/terminids-banner.svg"
    ],
    missImages: [
      "/assets/space-cadets/extraction-fail.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/space-cadets/extraction-selfie.svg",
        title: "Extraction ready",
        text: "Five correct answers in this run. Drop ship energy."
      },
      {
        threshold: 7,
        image: "/assets/space-cadets/orbital-strike.svg",
        title: "Orbital strike reached",
        text: "Seven correct answers. The stratagem crate lane is open."
      },
      {
        threshold: 8,
        image: "/assets/space-cadets/curated/terminids-banner.svg",
        title: "Terminid front bonus",
        text: "Eight correct answers. The bug front is watching the streak."
      },
      {
        threshold: 10,
        image: "/assets/space-cadets/mission-victory.svg",
        title: "Mission accomplished",
        text: "Perfect 10. That is Super Earth-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/space-cadets/orbital-strike.svg",
        title: "Orbital strike saved",
        text: "The mission keeps moving."
      },
      {
        image: "/assets/space-cadets/extraction-fail.svg",
        title: "Extraction recalibration",
        text: "Friendly reset bonus. Keep going."
      },
      {
        image: "/assets/space-cadets/extraction-selfie.svg",
        title: "Squad photobomb",
        text: "A quick extraction selfie crashed the spelling round."
      },
      {
        image: "/assets/space-cadets/curated/gameplay-banner.jpg",
        title: "Gameplay drop",
        text: "Helldivers 2 action showed up for that spelling win."
      },
      {
        image: "/assets/space-cadets/curated/automatons-flag.svg",
        title: "Automatons flag found",
        text: "An Automatons faction card popped in. Keep the run moving."
      },
      {
        image: "/assets/space-cadets/curated/illuminate-banner.svg",
        title: "Illuminate sector bonus",
        text: "The Illuminate sector is still glowing."
      }
    ],
    missMoments: [
      {
        image: "/assets/space-cadets/extraction-fail.svg",
        title: "Extraction reset",
        text: "Not scary. Just a recalibration back to the drop zone."
      }
    ],
    crateImage: "/assets/space-cadets/stratagem-crate.svg",
    sideImage: "/assets/space-cadets/curated/oppression-poster.webp",
    sideLabel: "Propaganda drop",
    sideTitle: "Super Earth watch"
  },
  "luigi-mansion": {
    className: "theme-luigi-mansion",
    scene: "Mansion Hall",
    tagline: "Flashlight beams, mansion keys, Poltergust pulls, and spooky-green glow.",
    cardLine: "Flashlights sweep and keys sparkle",
    props: ["KEY", "GLOW", "GHOST", "VACUUM", "GEM"],
    missProps: ["DUST", "WEB", "TRY"],
    correctMessages: ["Key discovered.", "Ghost gently captured.", "Flashlight charged."],
    missMessages: ["Flashlight flickered.", "Dust mark added.", "Hallway reset."],
    brandLogo: "/assets/luigi-mansion/luigis-mansion-wordmark.svg",
    brandMark: "/assets/luigi-mansion/Luigi_emblem.svg",
    stageImages: [
      "/assets/luigi-mansion/curated/lm3-banner.jpg",
      "/assets/luigi-mansion/curated/dark-moon-banner.png"
    ],
    flyImages: [
      "/assets/luigi-mansion/Luigi_emblem.svg",
      "/assets/luigi-mansion/flashlight-checkpoint.svg",
      "/assets/luigi-mansion/curated/lm3-banner.jpg",
      "/assets/luigi-mansion/curated/dark-moon-banner.png",
      "/assets/luigi-mansion/curated/king-boo-banner.svg"
    ],
    missImages: [
      "/assets/luigi-mansion/dust-reset.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/luigi-mansion/mansion-selfie.svg",
        title: "Ghost snap unlocked",
        text: "Five correct answers in this run. Portrait energy."
      },
      {
        threshold: 7,
        image: "/assets/luigi-mansion/flashlight-checkpoint.svg",
        title: "Flashlight checkpoint",
        text: "Seven correct answers. The portrait crate lane is open."
      },
      {
        threshold: 8,
        image: "/assets/luigi-mansion/curated/king-boo-banner.svg",
        title: "King Boo tower bonus",
        text: "Eight correct answers. The tower is watching the streak."
      },
      {
        threshold: 10,
        image: "/assets/luigi-mansion/mansion-victory.svg",
        title: "Mansion cleared",
        text: "Perfect 10. That is Poltergust-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/luigi-mansion/flashlight-checkpoint.svg",
        title: "Flashlight saved",
        text: "The mansion hunt keeps moving."
      },
      {
        image: "/assets/luigi-mansion/dust-reset.svg",
        title: "Dusty hallway",
        text: "Friendly reset bonus. Keep going."
      },
      {
        image: "/assets/luigi-mansion/mansion-selfie.svg",
        title: "Ghost photobomb",
        text: "A quick ghost snap crashed the spelling round."
      },
      {
        image: "/assets/luigi-mansion/curated/lm2hd-artwork.jpg",
        title: "2HD artwork drop",
        text: "Luigi's Mansion 2HD art showed up for that spelling win."
      },
      {
        image: "/assets/luigi-mansion/curated/gooigi-banner.svg",
        title: "Gooigi slime found",
        text: "A gooey helper card popped in. Keep the hunt moving."
      },
      {
        image: "/assets/luigi-mansion/curated/king-boo-banner.svg",
        title: "King Boo tower bonus",
        text: "The spooky tower is still glowing."
      }
    ],
    missMoments: [
      {
        image: "/assets/luigi-mansion/dust-reset.svg",
        title: "Hallway reset",
        text: "Not scary. Just a flashlight flicker back to the hall."
      }
    ],
    crateImage: "/assets/luigi-mansion/ghost-portrait-crate.svg",
    sideImage: "/assets/luigi-mansion/curated/dark-moon-screenshot.png",
    sideLabel: "Spooky drop",
    sideTitle: "Dark Moon watch"
  },
  "wizard-school": {
    className: "theme-wizard-school",
    scene: "Library Hall",
    tagline: "Hogwarts lanterns, spell cards, Hedwig drops, and house points.",
    cardLine: "Spell sparks drift upward",
    props: ["WAND", "OWL", "CHARM", "SPELL", "HOUSE"],
    missProps: ["DUST", "RUNE", "FIX"],
    correctMessages: ["Charm cast cleanly.", "House points added.", "Spellwork approved."],
    missMessages: ["Spell fizzled softly.", "Rune corrected.", "Try the incantation again."],
    brandLogo: "/assets/wizard-school/Harry_Potter_logo.svg",
    brandMark: "/assets/wizard-school/Hogwarts_Coat_of_Arms.svg",
    stageImages: [
      "/assets/wizard-school/curated/hogwarts-castle-banner.jpg",
      "/assets/wizard-school/curated/philosopher-stone-cover.jpg"
    ],
    flyImages: [
      "/assets/wizard-school/Hogwarts_Coat_of_Arms.svg",
      "/assets/wizard-school/charm-checkpoint.svg",
      "/assets/wizard-school/curated/hogwarts-castle-banner.jpg",
      "/assets/wizard-school/curated/philosopher-stone-cover.jpg",
      "/assets/wizard-school/curated/hedwig-banner.svg"
    ],
    missImages: [
      "/assets/wizard-school/spell-fizzle.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/wizard-school/library-selfie.svg",
        title: "Spell snap unlocked",
        text: "Five correct answers in this run. Owl-post energy."
      },
      {
        threshold: 7,
        image: "/assets/wizard-school/charm-checkpoint.svg",
        title: "Charm checkpoint",
        text: "Seven correct answers. The magical trunk lane is open."
      },
      {
        threshold: 8,
        image: "/assets/wizard-school/curated/bertie-botts-beans.png",
        title: "Bertie Bott's bonus",
        text: "Eight correct answers. Every-flavour beans are cheering."
      },
      {
        threshold: 10,
        image: "/assets/wizard-school/hogwarts-victory.svg",
        title: "House victory",
        text: "Perfect 10. That is Hogwarts-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/wizard-school/charm-checkpoint.svg",
        title: "Charm saved",
        text: "The spellwork keeps moving."
      },
      {
        image: "/assets/wizard-school/spell-fizzle.svg",
        title: "Spell fizzle",
        text: "Friendly fizzle bonus. Keep going."
      },
      {
        image: "/assets/wizard-school/library-selfie.svg",
        title: "Owl photobomb",
        text: "A quick spell snap crashed the spelling round."
      },
      {
        image: "/assets/wizard-school/curated/platform-nine-banner.jpg",
        title: "Platform drop",
        text: "Platform nine and three-quarters showed up for that spelling win."
      },
      {
        image: "/assets/wizard-school/curated/quidditch-banner.svg",
        title: "Quidditch pitch found",
        text: "A broom-flight card popped in. Keep the run moving."
      },
      {
        image: "/assets/wizard-school/curated/headmaster-banner.svg",
        title: "Headmaster's office",
        text: "The headmaster's office is still glowing."
      }
    ],
    missMoments: [
      {
        image: "/assets/wizard-school/spell-fizzle.svg",
        title: "Incantation reset",
        text: "Not scary. Just a soft fizzle back to the library."
      }
    ],
    crateImage: "/assets/wizard-school/magical-trunk-crate.svg",
    sideImage: "/assets/wizard-school/curated/hedwig-banner.svg",
    sideLabel: "Owl post",
    sideTitle: "Hedwig watch"
  },
  toybox: {
    className: "theme-toybox",
    scene: "Toy Shelf",
    tagline: "Woody, Buzz, Pizza Planet, Andy's room, and prize-box rescues.",
    cardLine: "Toy pieces hop into view",
    props: ["ROCKET", "BOOT", "DINO", "STAR", "SLINKY"],
    missProps: ["TAPE", "BOX", "RESET"],
    correctMessages: ["Toy token collected.", "To infinity and beyond.", "Shelf mission complete."],
    missMessages: ["Back to the toy box.", "Loose part found.", "Retape the label."],
    brandLogo: "/assets/toybox/Toy_Story_logo.svg",
    brandMark: "/assets/toybox/star-command-badge.svg",
    stageImages: [
      "/assets/toybox/curated/toy-story-one.jpg",
      "/assets/toybox/curated/woody-banner.jpg"
    ],
    flyImages: [
      "/assets/toybox/star-command-badge.svg",
      "/assets/toybox/launch-checkpoint.svg",
      "/assets/toybox/curated/toy-story-one.jpg",
      "/assets/toybox/curated/toy-story-two.jpg",
      "/assets/toybox/curated/pizza-planet-banner.svg"
    ],
    missImages: [
      "/assets/toybox/loose-part-reset.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/toybox/shelf-selfie.svg",
        title: "Shelf snap unlocked",
        text: "Five correct answers in this run. Rescue energy."
      },
      {
        threshold: 7,
        image: "/assets/toybox/launch-checkpoint.svg",
        title: "Launch checkpoint",
        text: "Seven correct answers. The prize box lane is open."
      },
      {
        threshold: 8,
        image: "/assets/toybox/curated/pizza-planet-banner.svg",
        title: "Pizza Planet bonus",
        text: "Eight correct answers. The claw machine is cheering."
      },
      {
        threshold: 10,
        image: "/assets/toybox/toybox-victory.svg",
        title: "Toybox victory",
        text: "Perfect 10. That is sheriff-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/toybox/launch-checkpoint.svg",
        title: "Launch saved",
        text: "The rescue run keeps moving."
      },
      {
        image: "/assets/toybox/loose-part-reset.svg",
        title: "Loose part found",
        text: "Friendly reset bonus. Keep going."
      },
      {
        image: "/assets/toybox/shelf-selfie.svg",
        title: "Toy photobomb",
        text: "A quick shelf snap crashed the spelling round."
      },
      {
        image: "/assets/toybox/curated/toy-story-land-banner.jpg",
        title: "Toy Story Land drop",
        text: "Toy Story Land showed up for that spelling win."
      },
      {
        image: "/assets/toybox/curated/slinky-banner.svg",
        title: "Slinky run found",
        text: "A slinky stair card popped in. Keep the run moving."
      },
      {
        image: "/assets/toybox/curated/andys-room-banner.svg",
        title: "Andy's room bonus",
        text: "The cloud-wall room is still glowing."
      }
    ],
    missMoments: [
      {
        image: "/assets/toybox/loose-part-reset.svg",
        title: "Toy box reset",
        text: "Not scary. Just a loose part back to the shelf."
      }
    ],
    crateImage: "/assets/toybox/prize-box-crate.svg",
    sideImage: "/assets/toybox/curated/pizza-planet-banner.svg",
    sideLabel: "Claw machine",
    sideTitle: "Pizza Planet watch"
  },
  "demigod-camp": {
    className: "theme-demigod-camp",
    scene: "Camp Quest",
    tagline: "Poseidon tridents, oracle prophecies, labyrinth runs, and Olympus victories.",
    cardLine: "Quest marks and bronze shields",
    props: ["TRIDENT", "QUEST", "ORACLE", "WAVE", "BOLT"],
    missProps: ["ORACLE", "MARK", "MAP"],
    correctMessages: ["Quest mark earned.", "Cabin banner raised.", "Hero point claimed."],
    missMessages: ["Oracle note recorded.", "Map route corrected.", "The quest continues."],
    brandLogo: "/assets/demigod-camp/demigod-camp-wordmark.svg",
    brandMark: "/assets/demigod-camp/poseidon-emblem.svg",
    stageImages: [
      "/assets/demigod-camp/curated/lightning-thief-cover.jpg",
      "/assets/demigod-camp/curated/parthenon-banner.jpg"
    ],
    flyImages: [
      "/assets/demigod-camp/poseidon-emblem.svg",
      "/assets/demigod-camp/oracle-checkpoint.svg",
      "/assets/demigod-camp/curated/lightning-thief-cover.jpg",
      "/assets/demigod-camp/curated/sea-of-monsters.gif",
      "/assets/demigod-camp/curated/labyrinth-banner.svg"
    ],
    missImages: [
      "/assets/demigod-camp/oracle-reset.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/demigod-camp/camp-selfie.svg",
        title: "Camp snap unlocked",
        text: "Five correct answers in this run. Quest energy."
      },
      {
        threshold: 7,
        image: "/assets/demigod-camp/oracle-checkpoint.svg",
        title: "Oracle checkpoint",
        text: "Seven correct answers. The quest cache lane is open."
      },
      {
        threshold: 8,
        image: "/assets/demigod-camp/curated/labyrinth-banner.svg",
        title: "Labyrinth bonus",
        text: "Eight correct answers. The maze is cheering."
      },
      {
        threshold: 10,
        image: "/assets/demigod-camp/olympus-victory.svg",
        title: "Olympus victory",
        text: "Perfect 10. That is demigod-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/demigod-camp/oracle-checkpoint.svg",
        title: "Quest saved",
        text: "The prophecy run keeps moving."
      },
      {
        image: "/assets/demigod-camp/oracle-reset.svg",
        title: "Oracle note found",
        text: "Friendly reset bonus. Keep going."
      },
      {
        image: "/assets/demigod-camp/camp-selfie.svg",
        title: "Camp photobomb",
        text: "A quick camp snap crashed the spelling round."
      },
      {
        image: "/assets/demigod-camp/curated/camp-gates-banner.svg",
        title: "Camp gates drop",
        text: "The bronze gates showed up for that spelling win."
      },
      {
        image: "/assets/demigod-camp/curated/ambrosia-banner.svg",
        title: "Ambrosia bowl found",
        text: "A golden ambrosia card popped in. Keep the run moving."
      },
      {
        image: "/assets/demigod-camp/curated/zeus-icon.jpg",
        title: "Olympus bonus",
        text: "The throne room is still glowing."
      }
    ],
    missMoments: [
      {
        image: "/assets/demigod-camp/oracle-reset.svg",
        title: "Oracle reset",
        text: "Not scary. Just an oracle note back to camp."
      }
    ],
    crateImage: "/assets/demigod-camp/quest-cache-crate.svg",
    sideImage: "/assets/demigod-camp/curated/labyrinth-banner.svg",
    sideLabel: "Labyrinth",
    sideTitle: "Oracle watch"
  },
  "goat-yard": {
    className: "theme-goat-yard",
    scene: "Stunt Yard",
    tagline: "Goat Simulator 3 headbutts, trampolines, jetpack goats, and trophy chaos.",
    cardLine: "Stunt props crash through",
    props: ["RAMP", "HAY", "BLEAT", "TROPHY", "BOING"],
    missProps: ["DENT", "RESET", "MUD"],
    correctMessages: ["Stunt landed.", "Trophy dent added.", "Ramp cleared."],
    missMessages: ["Ragdoll reset.", "Hay stack absorbed it.", "Stunt replay queued."],
    brandLogo: "/assets/goat-yard/goat-yard-wordmark.svg",
    brandMark: "/assets/goat-yard/goat-emblem.svg",
    stageImages: [
      "/assets/goat-yard/curated/goat-simulator-3-cover.png",
      "/assets/goat-yard/curated/goat-farm-banner.jpg"
    ],
    flyImages: [
      "/assets/goat-yard/goat-emblem.svg",
      "/assets/goat-yard/ramp-checkpoint.svg",
      "/assets/goat-yard/curated/goat-simulator-3-cover.png",
      "/assets/goat-yard/curated/goat-simulator-cover.jpg",
      "/assets/goat-yard/curated/headbutt-banner.svg"
    ],
    missImages: [
      "/assets/goat-yard/ragdoll-reset.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/goat-yard/bleat-selfie.svg",
        title: "Stunt snap unlocked",
        text: "Five correct answers in this run. Bleat energy."
      },
      {
        threshold: 7,
        image: "/assets/goat-yard/ramp-checkpoint.svg",
        title: "Ramp checkpoint",
        text: "Seven correct answers. The chaos crate lane is open."
      },
      {
        threshold: 8,
        image: "/assets/goat-yard/curated/headbutt-banner.svg",
        title: "Headbutt bonus",
        text: "Eight correct answers. Physics chaos unlocked."
      },
      {
        threshold: 10,
        image: "/assets/goat-yard/trophy-victory.svg",
        title: "Trophy yard",
        text: "Perfect 10. That is goat-simulator-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/goat-yard/ramp-checkpoint.svg",
        title: "Stunt saved",
        text: "The ragdoll run keeps moving."
      },
      {
        image: "/assets/goat-yard/ragdoll-reset.svg",
        title: "Ragdoll flop",
        text: "Friendly reset bonus. Keep going."
      },
      {
        image: "/assets/goat-yard/bleat-selfie.svg",
        title: "Goat photobomb",
        text: "A quick bleat snap crashed the spelling round."
      },
      {
        image: "/assets/goat-yard/curated/jetpack-banner.svg",
        title: "Jetpack goat drop",
        text: "A jetpack goat showed up for that spelling win."
      },
      {
        image: "/assets/goat-yard/curated/city-ramp-banner.svg",
        title: "City ramp found",
        text: "An open-world ramp card popped in. Keep the run moving."
      },
      {
        image: "/assets/goat-yard/curated/trampoline.png",
        title: "Trampoline bounce",
        text: "The trampoline is still wobbling."
      }
    ],
    missMoments: [
      {
        image: "/assets/goat-yard/ragdoll-reset.svg",
        title: "Ragdoll reset",
        text: "Not scary. Just a floppy respawn back to the yard."
      }
    ],
    crateImage: "/assets/goat-yard/chaos-crate.svg",
    sideImage: "/assets/goat-yard/curated/headbutt-banner.svg",
    sideLabel: "Headbutt lane",
    sideTitle: "Chaos watch"
  },
  "garden-goose": {
    className: "theme-garden-goose",
    scene: "Garden Job",
    tagline: "Untitled Goose Game honks, ribbon bows, crowns, knives, and picnic chaos.",
    cardLine: "Garden props sneak across",
    props: ["HONK", "BELL", "RAKE", "PICNIC", "BOW"],
    missProps: ["SHOE", "NOTE", "TRY"],
    correctMessages: ["Bell successfully borrowed.", "Garden job complete.", "Picnic item secured."],
    missMessages: ["Shoelace untied.", "Quiet mischief paused.", "Garden note added."],
    brandLogo: "/assets/garden-goose/garden-goose-wordmark.svg",
    brandMark: "/assets/garden-goose/goose-emblem.svg",
    stageImages: [
      "/assets/garden-goose/curated/cover-banner.jpg",
      "/assets/garden-goose/curated/goose-with-crown.jpeg"
    ],
    flyImages: [
      "/assets/garden-goose/goose-emblem.svg",
      "/assets/garden-goose/bell-checkpoint.svg",
      "/assets/garden-goose/curated/goose-with-crown.jpeg",
      "/assets/garden-goose/curated/goose-with-bow.png",
      "/assets/garden-goose/curated/goose-party-hat.svg",
      "/assets/garden-goose/curated/goose-knife.svg",
      "/assets/garden-goose/curated/goose-sun-hat.svg",
      "/assets/garden-goose/curated/goose-bowtie.svg",
      "/assets/garden-goose/curated/present-reward.jpeg"
    ],
    missImages: [
      "/assets/garden-goose/shoelace-reset.svg"
    ],
    milestoneStages: [
      {
        threshold: 5,
        image: "/assets/garden-goose/mischief-selfie.svg",
        title: "Mischief snap unlocked",
        text: "Five correct answers in this run. Honk energy."
      },
      {
        threshold: 7,
        image: "/assets/garden-goose/bell-checkpoint.svg",
        title: "Bell checkpoint",
        text: "Seven correct answers. The honk crate lane is open."
      },
      {
        threshold: 8,
        image: "/assets/garden-goose/curated/picnic-banner.svg",
        title: "Picnic bonus",
        text: "Eight correct answers. The basket is unguarded."
      },
      {
        threshold: 10,
        image: "/assets/garden-goose/garden-victory.svg",
        title: "Garden job done",
        text: "Perfect 10. That is goose-level spelling."
      }
    ],
    surpriseMoments: [
      {
        image: "/assets/garden-goose/bell-checkpoint.svg",
        title: "Bell saved",
        text: "The mischief run keeps moving."
      },
      {
        image: "/assets/garden-goose/shoelace-reset.svg",
        title: "Shoelace snag",
        text: "Friendly reset bonus. Keep going."
      },
      {
        image: "/assets/garden-goose/mischief-selfie.svg",
        title: "Goose photobomb",
        text: "A quick honk snap crashed the spelling round."
      },
      {
        image: "/assets/garden-goose/curated/goose-with-crown.jpeg",
        title: "Crown goose drop",
        text: "Royal goose energy showed up for that spelling win."
      },
      {
        image: "/assets/garden-goose/curated/goose-party-hat.svg",
        title: "Party hat found",
        text: "A party-hat goose popped in. Keep the run moving."
      },
      {
        image: "/assets/garden-goose/curated/goose-knife.svg",
        title: "Knife goose spotted",
        text: "The village is not ready for this goose."
      },
      {
        image: "/assets/garden-goose/curated/goose-sun-hat.svg",
        title: "Sun hat stolen",
        text: "The groundskeeper's hat is now goose property."
      },
      {
        image: "/assets/garden-goose/curated/goose-bowtie.svg",
        title: "Ribbon dressed",
        text: "The goose posed for a garden portrait."
      },
      {
        image: "/assets/garden-goose/curated/pub-performance-banner.svg",
        title: "Pub performance",
        text: "Honk, bow, flap wings. The patrons are impressed."
      },
      {
        image: "/assets/garden-goose/curated/present-reward.jpeg",
        title: "Present opened",
        text: "A reward is waiting at home."
      }
    ],
    missMoments: [
      {
        image: "/assets/garden-goose/shoelace-reset.svg",
        title: "Shoelace reset",
        text: "Not scary. Just an untied lace back to the garden."
      }
    ],
    crateImage: "/assets/garden-goose/honk-crate.svg",
    sideImage: "/assets/garden-goose/curated/goose-party-hat.svg",
    sideLabel: "Party goose",
    sideTitle: "Honk watch"
  }
};

const REWARD_THEME_IDS = new Set(["storybook", "blockworks", "mario-course", "space-cadets", "luigi-mansion", "wizard-school", "toybox", "demigod-camp", "goat-yard", "garden-goose"]);

function hasRewardTheme(themeId) {
  return REWARD_THEME_IDS.has(themeId);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icon(name) {
  return `<span class="icon ${name}" aria-hidden="true"></span>`;
}

function gradeLabel(grade) {
  return grade === 0 ? "Bonus" : `Grade ${grade}`;
}

function gradeBlurb(grade) {
  const blurbs = {
    1: "First steps",
    2: "Short words",
    4: "Growing vocabulary",
    5: "Bigger patterns",
    6: "Trickier spellings",
    7: "Challenge spellings",
  };
  return blurbs[grade] || "Practice words";
}

function gradeOptions(selected = "", includeBonus = true) {
  const grades = (state.grades || []).map(
    (grade) => `<option value="${grade}" ${Number(selected) === grade ? "selected" : ""}>${gradeLabel(grade)}</option>`
  );
  if (includeBonus) {
    grades.push(`<option value="0" ${Number(selected) === 0 ? "selected" : ""}>Bonus</option>`);
  }
  return grades.join("");
}

function themeById(id) {
  return state.themes.find((theme) => theme.id === id) || state.themes[0];
}

function treatmentFor(id) {
  return THEME_TREATMENTS[id] || THEME_TREATMENTS.storybook;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function sampleItems(items = [], count = 2) {
  const pool = [...items];
  const selected = [];
  while (pool.length && selected.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
}

function rotatedProps(props, offset = 0, count = 5) {
  return Array.from({ length: count }, (_, index) => props[(index + offset) % props.length]);
}

function renderPropRail(treatment, count = 5) {
  return `
    <div class="prop-rail" aria-hidden="true">
      ${rotatedProps(treatment.props, 0, count).map((prop, index) => `<span class="scene-prop prop-${index}">${escapeHtml(prop)}</span>`).join("")}
    </div>
  `;
}

function buildSurpriseProps(treatment, correct) {
  const source = correct ? treatment.props : treatment.missProps;
  return rotatedProps(source, Math.floor(Math.random() * source.length), correct ? 7 : 4);
}

function xpLabel(xp) {
  if (!xp) return "0 XP";
  return `${xp.total_xp} XP`;
}

function renderXpMeter(xp) {
  if (!xp) return "";
  const percent = Math.min(100, Math.round((xp.xp_into_level / xp.level_step) * 100));
  return `
    <div class="xp-meter">
      <div class="xp-meter-head">
        <strong>Level ${xp.level}</strong>
        <span>${escapeHtml(xp.rank)}</span>
      </div>
      <div class="xp-track" aria-label="XP to next level">
        <div class="xp-fill" style="--xp-progress: ${percent}%"></div>
      </div>
      <small>${xp.xp_to_next_level} XP to next level</small>
    </div>
  `;
}

function defaultXp() {
  return {
    total_xp: 0,
    level: 1,
    rank: "Guest",
    xp_into_level: 0,
    xp_to_next_level: 100,
    level_step: 100
  };
}

function normalizeChild(child) {
  const stats = child.stats || {};
  return {
    ...child,
    stats: {
      ...stats,
      xp: stats.xp || defaultXp(),
      collectibles: stats.collectibles || 0,
      badges: stats.badges || []
    }
  };
}

function renderSurpriseLayer(props, correct) {
  const treatment = treatmentFor(state.session?.theme_id);
  const imageSource = correct ? treatment.flyImages : treatment.missImages;
  const imageTiles = sampleItems(imageSource, 2).map((path, index) => `
    <img class="fly-image fly-img-${index}" src="${escapeHtml(path)}" alt="">
  `).join("");
  return `
    <div class="surprise-layer ${correct ? "correct" : "miss"}" aria-hidden="true">
      ${imageTiles}
      ${props.map((prop, index) => `<span class="fly-prop fly-${index}">${escapeHtml(prop)}</span>`).join("")}
    </div>
  `;
}

function buildThemeMoment(correct) {
  const themeId = state.session?.theme_id;
  if (!hasRewardTheme(themeId)) return null;
  const treatment = treatmentFor(themeId);
  if (correct && state.session.correct_count >= 10) {
    const victory = treatment.milestoneStages?.find((stage) => stage.threshold === 10);
    if (victory) {
      return {
        image: victory.image,
        title: `${victory.title} loading`,
        text: "Perfect run is in sight."
      };
    }
  }
  if (correct && state.session.correct_count >= 7) {
    const checkpoint = treatment.milestoneStages?.find((stage) => stage.threshold === 7);
    if (checkpoint) {
      return {
        image: checkpoint.image,
        title: `${checkpoint.title} lane`,
        text: "Mystery crate progress is active."
      };
    }
  }
  if (correct && (state.session.correct_count >= 5 || Math.random() < 0.42)) {
    return randomItem(treatment.surpriseMoments);
  }
  if (!correct && Math.random() < 0.55) {
    return randomItem(treatment.missMoments);
  }
  return null;
}

function renderSurpriseMoment(moment) {
  if (!moment) return "";
  return `
    <div class="blockworks-pop-card">
      <img src="${escapeHtml(moment.image)}" alt="">
      <div>
        <strong>${escapeHtml(moment.title)}</strong>
        <span>${escapeHtml(moment.text)}</span>
      </div>
    </div>
  `;
}

function renderThemeStage(theme, treatment, variant = "full") {
  return `
    <div class="theme-stage ${variant}">
      <div class="stage-copy">
        <span>${treatment.brandLogo ? `<img class="stage-logo" src="${escapeHtml(treatment.brandLogo)}" alt="${escapeHtml(treatment.scene)}">` : escapeHtml(treatment.scene)}</span>
        <strong>${escapeHtml(theme.name)}</strong>
        <small>${escapeHtml(treatment.tagline)}</small>
      </div>
      ${renderThemeImageStack(treatment, variant)}
      ${renderPropRail(treatment, variant === "compact" ? 4 : 5)}
    </div>
  `;
}

function renderThemeImageStack(treatment, variant = "full") {
  if (!treatment.stageImages?.length && !treatment.brandMark) return "";
  const images = [];
  if (treatment.brandMark) {
    images.push(`<img class="theme-floating-image brand-mark-image" src="${escapeHtml(treatment.brandMark)}" alt="">`);
  }
  for (const path of treatment.stageImages || []) {
    images.push(`<img class="theme-floating-image" src="${escapeHtml(path)}" alt="">`);
  }
  return `<div class="theme-image-stack ${variant === "compact" ? "compact" : ""}" aria-hidden="true">${images.join("")}</div>`;
}

function renderThemeMilestone(kind = "inline") {
  const themeId = state.session?.theme_id;
  if (!hasRewardTheme(themeId) || state.session.correct_count < 5) {
    return "";
  }
  const treatment = treatmentFor(themeId);
  const milestone = [...(treatment.milestoneStages || [])]
    .reverse()
    .find((stage) => state.session.correct_count >= stage.threshold);
  if (!milestone) return "";
  return `
    <div class="blockworks-milestone ${kind}">
      <img src="${escapeHtml(milestone.image)}" alt="">
      <div>
        <strong>${escapeHtml(milestone.title)}</strong>
        <span>${escapeHtml(milestone.text)}</span>
      </div>
    </div>
  `;
}

function renderRewardEvents(events = []) {
  if (!events.length) return "";
  return `
    <div class="reward-event-grid">
      ${events.map((event) => `
        <div class="reward-event-card">
          <img src="${escapeHtml(event.image_path)}" alt="">
          <strong>${escapeHtml(event.title)}</strong>
          <span>${escapeHtml(event.description)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderCrateReward(crate) {
  if (!crate) return "";
  const treatment = treatmentFor(crate.theme_id || state.session?.theme_id);
  if (!crate.collectible) {
    return `
      <div class="crate-reward">
        <img src="${escapeHtml(treatment.crateImage)}" alt="">
        <div>
          <strong>Mystery crate opened</strong>
          <span>${escapeHtml(crate.message)}</span>
        </div>
      </div>
    `;
  }
  return `
    <div class="crate-reward rarity-${escapeHtml(crate.collectible.rarity)}">
      <img src="${escapeHtml(crate.collectible.image_path)}" alt="">
      <div>
        <strong>${escapeHtml(crate.collectible.name)}</strong>
        <span>${escapeHtml(crate.message)} · ${escapeHtml(crate.collectible.description)}</span>
      </div>
    </div>
  `;
}

function childById(id) {
  return state.children.find((child) => child.id === Number(id));
}

function defaultGradeForChild(child) {
  const index = state.children.findIndex((item) => item.id === child.id);
  return state.grades[index] || state.grades[0] || 2;
}

async function loadBootstrap() {
  const data = await api("/api/bootstrap");
  state.children = data.children.map(normalizeChild);
  state.themes = data.themes;
  state.grades = data.grades;
  if (state.selectedChild) {
    state.selectedChild = childById(state.selectedChild.id) || state.children[0];
  }
}

function topbar(subtitle, backAction = "") {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">SB</div>
        <div>
          <h1>Spelling Practice</h1>
          <p>${escapeHtml(subtitle)}</p>
        </div>
      </div>
      <div class="topbar-actions">
        ${backAction ? `<button class="btn secondary" data-action="${backAction}" title="Back">${icon("back")}Back</button>` : ""}
        <button class="btn secondary" data-action="show-words" title="Words">${icon("words")}Words</button>
        <button class="btn secondary" data-action="show-dashboard" title="Dashboard">${icon("chart")}Dashboard</button>
      </div>
    </header>
  `;
}

function shell(subtitle, content, backAction = "", className = "") {
  return `<div class="shell ${className}">${topbar(subtitle, backAction)}${content}</div>`;
}

function renderHome() {
  state.session = null;
  state.feedback = null;
  state.currentIndex = 0;
  const profiles = state.children.map((child) => `
    <button class="profile-card" data-action="select-child" data-child-id="${child.id}" style="--profile-color: ${escapeHtml(child.accent_color)}">
      <div>
        <div class="profile-name"><span class="profile-dot"></span>${escapeHtml(child.name)}</div>
        <div class="metric-line">
          <span class="pill strong">${xpLabel(child.stats.xp)}</span>
          <span class="pill">${escapeHtml(child.stats.xp.rank)}</span>
          <span class="pill strong">${child.stats.correct_attempts} correct</span>
          <span class="pill">${child.stats.mastered_words} mastered</span>
          <span class="pill">${child.stats.current_streak} streak</span>
        </div>
        ${renderXpMeter(child.stats.xp)}
      </div>
      <div class="badge-list">
        ${child.stats.badges.length ? child.stats.badges.map((badge) => `<span class="pill good">${escapeHtml(badge.label)}</span>`).join("") : `<span class="pill">No badges yet</span>`}
      </div>
    </button>
  `).join("");

  app.innerHTML = shell("Choose a profile", `
    <section class="hero-strip">
      <div class="hero-copy">
        <h2>Choose a profile</h2>
      </div>
      <img class="hero-art" src="/assets/letter-burst.svg" alt="">
    </section>
    <section class="grid profile-grid">${profiles}</section>
  `);
}

function renderSetup() {
  const child = state.selectedChild;
  const unlocked = new Set(child.unlocked_theme_ids);
  const selectedTheme = themeById(state.selectedThemeId) || state.themes[0];
  const selectedTreatment = treatmentFor(selectedTheme.id);
  const gradeCards = state.grades.map((grade) => `
    <button class="grade-card ${state.selectedGrade === grade ? "active" : ""}" data-action="select-grade" data-grade="${grade}">
      <strong>${gradeLabel(grade)}</strong>
      <span>${gradeBlurb(grade)}</span>
    </button>
  `).join("");

  const themeCards = state.themes.map((theme) => {
    const isUnlocked = unlocked.has(theme.id);
    const isActive = state.selectedThemeId === theme.id;
    const treatment = treatmentFor(theme.id);
    return `
      <button class="theme-card ${treatment.className} ${isActive ? "active" : ""} ${isUnlocked ? "" : "locked"}"
        data-action="select-theme" data-theme-id="${theme.id}" ${isUnlocked ? "" : "disabled"}
        style="--theme-color: ${escapeHtml(theme.accent)}">
        <div class="theme-card-scene">${renderPropRail(treatment, 3)}</div>
        <span class="theme-icon">${themeIcon(theme.icon)}</span>
        <strong>${escapeHtml(theme.name)}</strong>
        <p>${isUnlocked ? escapeHtml(treatment.cardLine) : `${theme.unlock_correct_count} correct to unlock`}</p>
      </button>
    `;
  }).join("");

  app.innerHTML = shell(`${child.name} setup`, `
    <section class="setup-layout">
      <div class="setup-panel">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(child.name)}</h2>
            <p>${child.stats.xp.total_xp} XP, ${child.stats.correct_attempts} correct, ${child.stats.mastered_words} mastered</p>
          </div>
          <button class="btn small secondary" data-action="toggle-edit-child">Edit</button>
        </div>
        ${hasRewardTheme(selectedTheme.id) ? renderXpMeter(child.stats.xp) : ""}
        <div id="child-edit-slot"></div>

        <div class="section-title"><h3>Challenge</h3></div>
        <div class="grid grade-grid">${gradeCards}</div>

        <div class="section-title"><h3>Theme</h3></div>
        <div class="grid theme-grid">${themeCards}</div>
      </div>
      <aside class="side-panel">
        ${renderThemeStage(selectedTheme, selectedTreatment)}
        <div class="segmented">
          <button class="segment ${state.mode === "practice" ? "active" : ""}" data-action="select-mode" data-mode="practice">Practice</button>
          <button class="segment ${state.mode === "bonus" ? "active" : ""}" data-action="select-mode" data-mode="bonus">Bonus</button>
        </div>
        <div class="metric-line">
          <span class="pill strong">${SESSION_WORD_COUNT()} words</span>
          ${hasRewardTheme(selectedTheme.id) ? `<span class="pill strong">${escapeHtml(child.stats.xp.rank)}</span>` : ""}
          <span class="pill">2 hints each</span>
          <span class="pill">1 try</span>
        </div>
        <div class="badge-list">
          ${child.stats.badges.length ? child.stats.badges.map((badge) => `<span class="pill good">${escapeHtml(badge.label)}</span>`).join("") : `<span class="pill">Badges unlock here</span>`}
        </div>
        <div class="form-actions" style="margin-top: 18px;">
          <button class="btn primary" data-action="start-session">${icon("play")}Start</button>
          <button class="btn secondary" data-action="go-home">${icon("back")}Profiles</button>
        </div>
      </aside>
    </section>
  `, "go-home", `theme-shell theme-setup ${selectedTreatment.className}`);
}

function SESSION_WORD_COUNT() {
  return 10;
}

function renderChildEditor() {
  const child = state.selectedChild;
  const slot = document.getElementById("child-edit-slot");
  if (!slot) return;
  slot.innerHTML = `
    <form class="child-edit" data-form="child-edit">
      <div class="field">
        <label for="child-name">Name</label>
        <input id="child-name" name="name" value="${escapeHtml(child.name)}" autocomplete="off">
      </div>
      <div class="field">
        <label for="child-color">Color</label>
        <input id="child-color" name="accent_color" type="color" value="${escapeHtml(child.accent_color)}">
      </div>
      <div class="form-actions">
        <button class="btn primary" type="submit">${icon("save")}Save</button>
        <button class="btn secondary" type="button" data-action="cancel-edit-child">Cancel</button>
      </div>
    </form>
  `;
}

function themeIcon(name) {
  const map = {
    "book-open": "Aa",
    box: "[]",
    flag: "F",
    flashlight: "L",
    rocket: "^",
    sparkles: "*",
    badge: "B",
    shield: "S",
    wand: "/",
    trophy: "T",
    bell: "!"
  };
  return map[name] || "*";
}

function renderSession() {
  const session = state.session;
  if (!session) {
    renderHome();
    return;
  }
  if (session.summary && !state.feedback) {
    renderSummary();
    return;
  }
  const current = session.words[state.currentIndex];
  const progress = Math.round((session.answered_count / session.total_words) * 100);
  const theme = themeById(session.theme_id) || { id: session.theme_id, name: session.theme_name };
  const treatment = treatmentFor(session.theme_id);
  const themeClass = `theme-shell ${treatment.className} theme-background-${session.theme_background}`;
  const pattern = current.pattern.map((letter) => `
    <span class="letter-box ${letter !== "_" ? "revealed" : ""}">${letter === "_" ? "" : escapeHtml(letter)}</span>
  `).join("");
  const feedback = state.feedback ? renderFeedback(state.feedback) : "";

  app.innerHTML = `
    <div class="shell session-shell ${themeClass}" style="--accent: ${escapeHtml(session.theme_accent)}">
      ${topbar(`${session.child_name} - ${gradeLabel(session.grade_level)}`, "back-to-setup")}
      <section class="practice-panel">
        <div class="practice-head">
          <div class="theme-session-head">
            ${renderThemeStage(theme, treatment, "compact")}
            <div class="session-meter">
              <span class="pill strong">${session.mode === "bonus" ? "Bonus" : "Practice"}</span>
              <span class="pill">Word ${current.ordinal} of ${session.total_words}</span>
            </div>
          </div>
          <div class="progress-bar" aria-label="Session progress">
            <div class="progress-fill" style="--progress: ${progress}%"></div>
          </div>
        </div>
        <div class="practice-body">
          <div class="word-zone">
            <div class="audio-pad">
              <button class="play-button" data-action="play-audio" title="Play word" aria-label="Play word">&gt;</button>
              <div>
                <span class="pill">${current.word_length} letters</span>
                <span class="pill">${current.max_hints - current.hints_used} hints left</span>
              </div>
            </div>
            <div class="pattern" aria-label="Revealed letters">${pattern}</div>
            ${feedback || renderAnswerForm(current)}
            <div class="status-line">${escapeHtml(state.status)}</div>
          </div>
          <aside class="session-side">
            <div class="session-card">
              <span class="muted">Answered</span>
              <strong>${session.answered_count}/${session.total_words}</strong>
            </div>
            <div class="session-card">
              <span class="muted">Correct</span>
              <strong>${session.correct_count}</strong>
            </div>
            <div class="session-card">
              <span class="muted">XP this run</span>
              <strong>${session.xp_earned || 0}</strong>
            </div>
            <div class="session-card theme-callout">
              <span class="muted">${escapeHtml(treatment.scene)}</span>
              <strong>${escapeHtml(randomItem(treatment.props))}</strong>
            </div>
            ${treatment.sideImage ? `
              <div class="session-card blockworks-side-card">
                <img src="${escapeHtml(treatment.sideImage)}" alt="">
                <span class="muted">${escapeHtml(treatment.sideLabel || "Surprise room")}</span>
                <strong>${escapeHtml(treatment.sideTitle || "Bonus watch")}</strong>
              </div>
            ` : ""}
            ${renderThemeMilestone("side")}
            <button class="btn secondary" data-action="use-hint" ${current.hints_used >= current.max_hints || current.answered ? "disabled" : ""}>${icon("hint")}Hint</button>
            <button class="btn warn" data-action="abandon-session">End Session</button>
          </aside>
        </div>
      </section>
    </div>
  `;
}

function renderAnswerForm(current) {
  return `
    <form class="answer-form" data-form="answer">
      <input class="answer-input" name="answer" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Spelling answer" autofocus>
      <button class="btn primary" type="submit">${icon("check")}Submit</button>
    </form>
  `;
}

function renderFeedback(feedback) {
  const done = feedback.session_complete;
  const treatment = treatmentFor(state.session?.theme_id);
  const props = feedback.surpriseProps || buildSurpriseProps(treatment, feedback.correct);
  const title = feedback.themeMessage || (feedback.correct ? treatment.correctMessages[0] : treatment.missMessages[0]);
  return `
    <div class="feedback ${feedback.correct ? "" : "miss"}">
      <strong>${escapeHtml(title)}</strong>
      ${feedback.correct ? "" : `<span>Correct spelling: <b>${escapeHtml(feedback.correct_word)}</b></span>`}
      ${feedback.correct && feedback.xp_earned ? `<span class="xp-toast">+${feedback.xp_earned} XP</span>` : ""}
      ${feedback.definition ? `<span>${escapeHtml(feedback.definition)}</span>` : ""}
      ${feedback.example_sentence ? `<span class="muted">${escapeHtml(feedback.example_sentence)}</span>` : ""}
      ${renderThemeMilestone("feedback")}
      ${renderSurpriseMoment(feedback.surpriseMoment)}
      ${renderSurpriseLayer(props, feedback.correct)}
      <div class="form-actions">
        <button class="btn primary" data-action="${done ? "show-summary" : "next-word"}">${icon("next")}${done ? "Summary" : "Next"}</button>
      </div>
    </div>
  `;
}

function renderSummary() {
  const summary = state.session.summary;
  summary.child_stats = normalizeChild({ stats: summary.child_stats || {} }).stats;
  summary.reward_events = summary.reward_events || [];
  summary.newly_unlocked_themes = summary.newly_unlocked_themes || [];
  const theme = themeById(state.session.theme_id) || { id: state.session.theme_id, name: state.session.theme_name };
  const treatment = treatmentFor(state.session.theme_id);
  const misses = summary.misses.length
    ? summary.misses.map((miss) => `<span class="pill">${escapeHtml(miss.word)}</span>`).join("")
    : `<span class="pill good">No misses</span>`;
  const unlocks = summary.newly_unlocked_themes.length
    ? summary.newly_unlocked_themes.map((theme) => `<span class="pill good">${escapeHtml(theme.name)}</span>`).join("")
    : `<span class="pill">No new themes</span>`;
  const badges = summary.child_stats.badges.length
    ? summary.child_stats.badges.map((badge) => `<span class="pill good">${escapeHtml(badge.label)}</span>`).join("")
    : `<span class="pill">No badges yet</span>`;

  app.innerHTML = shell("Session summary", `
    <section class="summary-panel">
      <div>
        <h2>${summary.correct_count}/${summary.total_words} correct</h2>
        <div class="metric-line">
          <span class="pill strong">+${summary.xp_earned || 0} XP</span>
          <span class="pill">${escapeHtml(summary.child_stats.xp.rank)}</span>
          <span class="pill strong">${summary.accuracy}% accuracy</span>
          <span class="pill">${summary.child_stats.current_streak} streak</span>
          <span class="pill">${summary.child_stats.mastered_words} mastered</span>
        </div>
        ${renderXpMeter(summary.child_stats.xp)}
        ${renderRewardEvents(summary.reward_events)}
        ${renderCrateReward(summary.crate_reward)}
        <div class="section-title"><h3>Misses</h3></div>
        <div class="miss-list">${misses}</div>
        <div class="section-title"><h3>Unlocks</h3></div>
        <div class="unlock-list">${unlocks}</div>
        <div class="section-title"><h3>Badges</h3></div>
        <div class="badge-list">${badges}</div>
        ${renderThemeMilestone("summary")}
        <div class="form-actions" style="margin-top: 20px;">
          <button class="btn primary" data-action="back-to-setup">${icon("play")}New Session</button>
          <button class="btn secondary" data-action="go-home">${icon("back")}Profiles</button>
          <button class="btn secondary" data-action="show-dashboard">${icon("chart")}Dashboard</button>
        </div>
      </div>
      <div class="summary-art">
        ${renderThemeStage(theme, treatment, "compact")}
        <img class="badge-art" src="/assets/badge-mastered.svg" alt="">
      </div>
    </section>
  `, "", `theme-shell theme-summary ${treatment.className}`);
}

async function renderDashboard() {
  const data = state.dashboard || await api("/api/dashboard");
  data.children = (data.children || []).map(normalizeChild);
  data.leaderboard = data.leaderboard || data.children
    .map((child) => ({
      child_id: child.id,
      child_name: child.name,
      xp: child.stats.xp.total_xp,
      level: child.stats.xp.level,
      rank: child.stats.xp.rank,
      collectibles: child.stats.collectibles,
      correct_attempts: child.stats.correct_attempts || 0
    }))
    .sort((a, b) => b.xp - a.xp || b.correct_attempts - a.correct_attempts);
  data.recent_sessions = data.recent_sessions || [];
  data.recent_collectibles = data.recent_collectibles || [];
  data.review_words = data.review_words || [];
  state.dashboard = data;
  const childCards = data.children.map((child) => `
    <div class="stat-card">
      <span class="muted">${escapeHtml(child.name)}</span>
      <strong>${child.stats.xp.total_xp} XP</strong>
      <div class="metric-line">
        <span class="pill strong">Level ${child.stats.xp.level}</span>
        <span class="pill">${escapeHtml(child.stats.xp.rank)}</span>
        <span class="pill">${child.stats.correct_attempts} correct</span>
        <span class="pill">${child.stats.mastered_words} mastered</span>
        <span class="pill">${child.stats.needs_review} review</span>
      </div>
      ${renderXpMeter(child.stats.xp)}
    </div>
  `).join("");
  const leaderboard = data.leaderboard.length ? data.leaderboard.map((entry, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(entry.child_name)}</td>
      <td>${entry.xp}</td>
      <td>Level ${entry.level}</td>
      <td>${escapeHtml(entry.rank)}</td>
      <td>${entry.collectibles}</td>
    </tr>
  `).join("") : `<tr><td colspan="6">No XP yet.</td></tr>`;
  const sessions = data.recent_sessions.length ? data.recent_sessions.map((session) => `
    <tr>
      <td>${escapeHtml(session.child_name)}</td>
      <td>${gradeLabel(session.grade_level)}</td>
      <td>${escapeHtml(session.theme_name || "Theme")}</td>
      <td>${session.correct_count}/${session.total_words}</td>
      <td>${session.xp_earned || 0}</td>
      <td>${session.accuracy}%</td>
      <td>${formatDate(session.completed_at)}</td>
    </tr>
  `).join("") : `<tr><td colspan="7">No completed sessions yet.</td></tr>`;
  const collectibles = data.recent_collectibles.length ? data.recent_collectibles.map((card) => `
    <div class="collectible-card rarity-${escapeHtml(card.rarity)}">
      <img src="${escapeHtml(card.image_path)}" alt="">
      <div>
        <strong>${escapeHtml(card.name)}</strong>
        <span>${escapeHtml(card.child_name)} · ${escapeHtml(card.rarity)}</span>
      </div>
    </div>
  `).join("") : `<div class="empty-state">No BlockWorks cards collected yet.</div>`;
  const review = data.review_words.length ? data.review_words.map((word) => `
    <tr>
      <td>${escapeHtml(word.child_name)}</td>
      <td>${escapeHtml(word.word)}</td>
      <td>${gradeLabel(word.grade_level)}</td>
      <td>${word.missed_count}</td>
      <td>${word.correct_streak}</td>
    </tr>
  `).join("") : `<tr><td colspan="5">No review words yet.</td></tr>`;

  app.innerHTML = shell("Dashboard", `
    <section class="dashboard-panel">
      <div class="dashboard-grid">${childCards}</div>
      <div class="section-title"><h3>XP Leaderboard</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Child</th><th>XP</th><th>Level</th><th>Rank</th><th>Cards</th></tr></thead>
          <tbody>${leaderboard}</tbody>
        </table>
      </div>
      <div class="section-title"><h3>BlockWorks Cards</h3></div>
      <div class="collectible-grid">${collectibles}</div>
      <div class="section-title"><h3>Recent Sessions</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Child</th><th>Level</th><th>Theme</th><th>Score</th><th>XP</th><th>Accuracy</th><th>Completed</th></tr></thead>
          <tbody>${sessions}</tbody>
        </table>
      </div>
      <div class="section-title"><h3>Review Words</h3></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Child</th><th>Word</th><th>Level</th><th>Misses</th><th>Streak</th></tr></thead>
          <tbody>${review}</tbody>
        </table>
      </div>
    </section>
  `, "go-home");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

async function loadWords() {
  const query = state.wordFilter ? `?grade_level=${encodeURIComponent(state.wordFilter)}` : "";
  const data = await api(`/api/words${query}`);
  state.words = data.words;
}

async function renderWords() {
  if (!state.words.length) {
    await loadWords();
  }
  const rows = state.words.map((word) => `
    <tr>
      <td>${escapeHtml(word.word)}</td>
      <td>${gradeLabel(word.grade_level)}</td>
      <td>${escapeHtml(word.definition)}</td>
      <td>${escapeHtml((word.theme_tags || []).join(", "))}</td>
      <td><button class="btn small secondary" data-action="edit-word" data-word-id="${word.id}">Edit</button></td>
    </tr>
  `).join("");
  const draft = state.wordDraft || {};
  app.innerHTML = shell("Words", `
    <section class="word-editor-grid">
      <div class="editor-panel">
        <form class="editor-form" data-form="word">
          <div class="section-title" style="margin-top: 0;"><h2>${draft.id ? "Edit Word" : "Add Word"}</h2></div>
          <input type="hidden" name="id" value="${escapeHtml(draft.id || "")}">
          <div class="field">
            <label for="word-text">Word</label>
            <input id="word-text" name="word" value="${escapeHtml(draft.word || "")}" autocomplete="off" required>
          </div>
          <div class="field">
            <label for="word-grade">Grade</label>
            <select id="word-grade" name="grade_level" ${draft.id ? "disabled" : ""}>
              ${gradeOptions(draft.grade_level || state.grades[0] || 2)}
            </select>
          </div>
          <div class="field">
            <label for="word-definition">Definition</label>
            <textarea id="word-definition" name="definition">${escapeHtml(draft.definition || "")}</textarea>
          </div>
          <div class="field">
            <label for="word-sentence">Example sentence</label>
            <textarea id="word-sentence" name="example_sentence">${escapeHtml(draft.example_sentence || "")}</textarea>
          </div>
          <div class="field">
            <label for="word-tags">Tags</label>
            <input id="word-tags" name="difficulty_tags" value="${escapeHtml((draft.difficulty_tags || []).join(", "))}">
          </div>
          <div class="field">
            <label for="word-themes">Theme tags</label>
            <input id="word-themes" name="theme_tags" value="${escapeHtml((draft.theme_tags || []).join(", "))}">
          </div>
          <div class="form-actions">
            <button class="btn primary" type="submit">${icon("save")}${draft.id ? "Update" : "Add"}</button>
            ${draft.id ? `<button class="btn secondary" type="button" data-action="clear-word-draft">Cancel</button>` : ""}
          </div>
        </form>
        <form class="editor-form" data-form="bulk-words" style="margin-top: 24px;">
          <div class="section-title"><h3>Bulk Add</h3></div>
          <div class="field">
            <label for="bulk-grade">Grade</label>
            <select id="bulk-grade" name="grade_level">
              ${gradeOptions(state.grades[0] || 2)}
            </select>
          </div>
          <div class="field">
            <label for="bulk-lines">Lines</label>
            <textarea id="bulk-lines" name="lines" placeholder="word | definition | example sentence | tags"></textarea>
          </div>
          <button class="btn secondary" type="submit">${icon("save")}Add Lines</button>
        </form>
      </div>
      <div class="editor-panel">
        <div class="section-title" style="margin-top: 0;">
          <h2>Word Pool</h2>
          <select data-action="filter-words" aria-label="Filter words">
            <option value="" ${state.wordFilter === "" ? "selected" : ""}>All</option>
            ${(state.grades || []).map((grade) => `<option value="${grade}" ${state.wordFilter === String(grade) ? "selected" : ""}>${gradeLabel(grade)}</option>`).join("")}
            <option value="0" ${state.wordFilter === "0" ? "selected" : ""}>Bonus</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Word</th><th>Level</th><th>Definition</th><th>Themes</th><th></th></tr></thead>
            <tbody>${rows || `<tr><td colspan="5">No words found.</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    </section>
  `, "go-home");
}

async function startSession() {
  state.status = "";
  const session = await api("/api/sessions", {
    method: "POST",
    body: JSON.stringify({
      child_id: state.selectedChild.id,
      grade_level: state.selectedGrade,
      theme_id: state.selectedThemeId,
      mode: state.mode
    })
  });
  state.session = session;
  state.currentIndex = 0;
  state.feedback = null;
  renderSession();
}

async function useHint() {
  const current = state.session.words[state.currentIndex];
  const result = await api(`/api/sessions/${state.session.id}/hint`, {
    method: "POST",
    body: JSON.stringify({ session_word_id: current.session_word_id })
  });
  current.pattern = result.pattern;
  current.hints_used = result.hints_used;
  renderSession();
}

async function submitAnswer(form) {
  const current = state.session.words[state.currentIndex];
  const formData = new FormData(form);
  const result = await api(`/api/sessions/${state.session.id}/answer`, {
    method: "POST",
    body: JSON.stringify({
      session_word_id: current.session_word_id,
      answer: formData.get("answer")
    })
  });
  current.answered = true;
  current.submitted_answer = result.submitted_answer;
  current.correct = result.correct;
  current.correct_word = result.correct_word;
  current.definition = result.definition;
  current.example_sentence = result.example_sentence;
  const treatment = treatmentFor(state.session.theme_id);
  state.session.answered_count += 1;
  state.session.correct_count += result.correct ? 1 : 0;
  state.session.xp_earned = (state.session.xp_earned || 0) + (result.xp_earned || 0);
  result.themeMessage = randomItem(result.correct ? treatment.correctMessages : treatment.missMessages);
  result.surpriseProps = buildSurpriseProps(treatment, result.correct);
  result.surpriseMoment = buildThemeMoment(result.correct);
  state.feedback = result;
  if (result.session_complete) {
    state.session.summary = result.summary;
    await loadBootstrap();
  }
  renderSession();
}

async function playCurrentAudio() {
  const current = state.session.words[state.currentIndex];
  if (!current.audio_word_path) {
    state.status = "Audio has not been generated for this word.";
    renderSession();
    return;
  }
  try {
    if (state.currentAudio) {
      state.currentAudio.pause();
    }
    state.currentAudio = new Audio(current.audio_word_path);
    await state.currentAudio.play();
    state.status = "";
  } catch (error) {
    state.status = "Audio is missing. Run scripts/generate_audio.py.";
    renderSession();
  }
}

async function abandonSession() {
  if (!window.confirm("End this session? Unfinished progress will be lost.")) return;
  await api(`/api/sessions/${state.session.id}/abandon`, { method: "POST", body: "{}" });
  state.session = null;
  state.feedback = null;
  renderSetup();
}

async function saveChild(form) {
  const data = new FormData(form);
  const child = await api(`/api/children/${state.selectedChild.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: data.get("name"),
      accent_color: data.get("accent_color")
    })
  });
  await loadBootstrap();
  state.selectedChild = childById(child.id);
  renderSetup();
}

async function saveWord(form) {
  const data = new FormData(form);
  const id = data.get("id");
  const payload = {
    word: data.get("word"),
    grade_level: Number(data.get("grade_level") || state.wordDraft?.grade_level || 2),
    definition: data.get("definition"),
    example_sentence: data.get("example_sentence"),
    difficulty_tags: data.get("difficulty_tags"),
    theme_tags: data.get("theme_tags")
  };
  if (id) {
    await api(`/api/words/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  } else {
    await api("/api/words", { method: "POST", body: JSON.stringify(payload) });
  }
  state.wordDraft = null;
  state.words = [];
  await loadWords();
  renderWords();
}

async function saveBulkWords(form) {
  const data = new FormData(form);
  const gradeLevel = Number(data.get("grade_level"));
  const lines = String(data.get("lines") || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    const [word, definition = "", example_sentence = "", difficulty_tags = ""] = line.split("|").map((part) => part.trim());
    if (!word) continue;
    await api("/api/words", {
      method: "POST",
      body: JSON.stringify({ word, grade_level: gradeLevel, definition, example_sentence, difficulty_tags })
    });
  }
  state.words = [];
  await loadWords();
  renderWords();
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  try {
    if (action === "select-child") {
      state.selectedChild = childById(target.dataset.childId);
      state.selectedGrade = defaultGradeForChild(state.selectedChild);
      state.selectedThemeId = state.selectedChild.selected_theme_id || "storybook";
      state.mode = "practice";
      renderSetup();
    } else if (action === "go-home") {
      await loadBootstrap();
      renderHome();
    } else if (action === "select-grade") {
      state.selectedGrade = Number(target.dataset.grade);
      renderSetup();
    } else if (action === "select-theme") {
      state.selectedThemeId = target.dataset.themeId;
      renderSetup();
    } else if (action === "select-mode") {
      state.mode = target.dataset.mode;
      renderSetup();
    } else if (action === "start-session") {
      await startSession();
    } else if (action === "back-to-setup") {
      state.session = null;
      state.feedback = null;
      await loadBootstrap();
      renderSetup();
    } else if (action === "play-audio") {
      await playCurrentAudio();
    } else if (action === "use-hint") {
      await useHint();
    } else if (action === "next-word") {
      state.feedback = null;
      state.currentIndex = Math.min(state.currentIndex + 1, state.session.words.length - 1);
      renderSession();
    } else if (action === "show-summary") {
      renderSummary();
    } else if (action === "abandon-session") {
      await abandonSession();
    } else if (action === "show-dashboard") {
      state.dashboard = await api("/api/dashboard");
      await renderDashboard();
    } else if (action === "show-words") {
      state.words = [];
      await loadWords();
      await renderWords();
    } else if (action === "toggle-edit-child") {
      renderChildEditor();
    } else if (action === "cancel-edit-child") {
      const slot = document.getElementById("child-edit-slot");
      if (slot) slot.innerHTML = "";
    } else if (action === "edit-word") {
      state.wordDraft = state.words.find((word) => word.id === target.dataset.wordId);
      await renderWords();
    } else if (action === "clear-word-draft") {
      state.wordDraft = null;
      await renderWords();
    }
  } catch (error) {
    window.alert(error.message);
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target;
  const type = form.dataset.form;
  if (!type) return;
  event.preventDefault();
  try {
    if (type === "answer") {
      await submitAnswer(form);
    } else if (type === "child-edit") {
      await saveChild(form);
    } else if (type === "word") {
      await saveWord(form);
    } else if (type === "bulk-words") {
      await saveBulkWords(form);
    }
  } catch (error) {
    window.alert(error.message);
  }
});

document.addEventListener("change", async (event) => {
  const target = event.target.closest("[data-action='filter-words']");
  if (!target) return;
  state.wordFilter = target.value;
  state.words = [];
  await loadWords();
  await renderWords();
});

loadBootstrap()
  .then(renderHome)
  .catch((error) => {
    app.innerHTML = `<div class="loading-screen">${escapeHtml(error.message)}</div>`;
  });
