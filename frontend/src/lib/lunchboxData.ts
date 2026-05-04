export interface NutrientEntry {
  name: string;
  source: string;
  benefit: string;
}

export interface LunchboxItem {
  name: string;
  teacherNote: string;
  kidScript: string;
  nutrients: NutrientEntry[];
  alternative: string;
}

export interface DailyLunchbox {
  id: number;
  main: LunchboxItem;
  side: LunchboxItem;
  snack: LunchboxItem;
  drink: LunchboxItem;
}

export const LUNCHBOXES: DailyLunchbox[] = [
  {
    id: 1,
    main: {
      name: 'Chicken and salad wrap',
      teacherNote: 'Chicken provides complete protein that digests slowly, keeping hunger away for longer and supporting muscle recovery after physical activity. A wrap makes it easy to eat without mess — a reliable main that keeps children comfortable and focused all afternoon.',
      kidScript: '"This keeps you full and gives your muscles the fuel they need to play and learn all afternoon."',
      nutrients: [
        { name: 'Protein',    source: 'from the chicken',          benefit: 'helps your muscles grow and repair' },
        { name: 'B vitamins', source: 'from the chicken and wrap', benefit: 'turn your food into energy your body can use' },
        { name: 'Zinc',       source: 'from the chicken',          benefit: 'keeps your immune system strong' },
      ],
      alternative: 'Turkey and salad wrap',
    },
    side: {
      name: 'Carrot sticks',
      teacherNote: 'Carrots are rich in beta-carotene, which the body converts to vitamin A — essential for eyesight and immune function. Naturally sweet and crunchy, they are easy for children to enjoy with no preparation required.',
      kidScript: '"These help your eyes see clearly — great for reading and spotting things on the pitch."',
      nutrients: [
        { name: 'Vitamin A', source: 'from beta-carotene in the carrot', benefit: 'helps your eyes see well' },
        { name: 'Fibre',     source: 'from the carrot',                  benefit: 'helps your tummy feel comfortable' },
        { name: 'Vitamin C', source: 'from the carrot',                  benefit: 'helps keep you from getting sick' },
      ],
      alternative: 'Cucumber slices',
    },
    snack: {
      name: 'Apple slices',
      teacherNote: 'Apples release energy slowly due to their fibre content, avoiding the spike and crash that processed snacks cause. They travel well, need no prep, and are a reliable option for keeping children comfortable and focused between meals.',
      kidScript: '"This gives you gentle energy that lasts — you won\'t go from bouncy to tired like sugary sweets make you."',
      nutrients: [
        { name: 'Fibre',          source: 'from the apple skin and flesh', benefit: 'helps your tummy feel full and happy' },
        { name: 'Vitamin C',      source: 'from the apple',                benefit: 'helps your body stay healthy' },
        { name: 'Natural sugars', source: 'from the apple',                benefit: 'give you slow, steady energy' },
      ],
      alternative: 'Pear slices',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Even mild dehydration measurably affects a child\'s ability to concentrate and regulate their mood. Water is the most effective drink for maintaining focus, digestion, and physical comfort throughout the school day.',
      kidScript: '"Water keeps your brain switched on — even feeling a tiny bit thirsty can make it harder to think."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Unsweetened diluted juice',
    },
  },
  {
    id: 2,
    main: {
      name: 'Tuna and sweetcorn sandwich',
      teacherNote: 'Tuna is one of the richest dietary sources of omega-3 fats, which directly support brain function, memory, and concentration. Iodine in tuna also helps stabilise energy levels — making this one of the best midday meals for classroom focus.',
      kidScript: '"This feeds your brain — the good fats in tuna help you remember things and stay concentrated."',
      nutrients: [
        { name: 'Omega-3 fats', source: 'from the tuna', benefit: 'help your brain think and remember clearly' },
        { name: 'Protein',      source: 'from the tuna', benefit: 'keeps you full and helps muscles repair' },
        { name: 'Iodine',       source: 'from the tuna', benefit: 'keeps your energy levels steady all day' },
      ],
      alternative: 'Salmon and cucumber sandwich',
    },
    side: {
      name: 'Cucumber slices',
      teacherNote: 'Cucumber is made up of around 95% water, quietly supporting hydration alongside whatever the child is drinking. It is very easy on the stomach and a good option for children who feel uncomfortable after eating.',
      kidScript: '"These help keep you hydrated — your body gets water from food too, not just drinks."',
      nutrients: [
        { name: 'Vitamin K',     source: 'from the cucumber', benefit: 'helps your bones stay strong' },
        { name: 'Potassium',     source: 'from the cucumber', benefit: 'helps your muscles and heart work properly' },
        { name: 'Water content', source: 'from the cucumber', benefit: 'keeps you hydrated throughout the day' },
      ],
      alternative: 'Celery sticks',
    },
    snack: {
      name: 'Banana',
      teacherNote: 'Bananas are one of the most practical snacks in a school setting — no prep, no mess, no allergen concerns. Potassium supports muscle function during physical activity, and natural sugars provide a reliable energy lift when children start to flag.',
      kidScript: '"This gives you a quick energy lift and helps your muscles work well after PE."',
      nutrients: [
        { name: 'Potassium',      source: 'from the banana', benefit: 'helps your muscles work well after being active' },
        { name: 'Vitamin B6',     source: 'from the banana', benefit: 'helps your brain feel calm and happy' },
        { name: 'Natural sugars', source: 'from the banana', benefit: 'give you a quick, useful energy lift' },
      ],
      alternative: 'A small bunch of grapes',
    },
    drink: {
      name: 'Semi-skimmed milk',
      teacherNote: 'Milk provides calcium, protein, and vitamin D in a single carton. Children\'s bones are still actively developing, and a small carton at lunch is one of the easiest ways to support that process every day.',
      kidScript: '"This builds strong bones and teeth — your body is growing right now and this is exactly what it needs."',
      nutrients: [
        { name: 'Calcium',   source: 'from the milk',     benefit: 'builds strong bones and teeth' },
        { name: 'Protein',   source: 'from the milk',     benefit: 'keeps you full and helps muscles develop' },
        { name: 'Vitamin D', source: 'added to the milk', benefit: 'helps your body absorb calcium properly' },
      ],
      alternative: 'Oat milk (fortified with calcium)',
    },
  },
  {
    id: 3,
    main: {
      name: 'Cheese and ham wholegrain roll',
      teacherNote: 'Wholegrain bread releases energy far more slowly than white bread, keeping children fuelled and alert well into the afternoon. The cheese provides calcium for bone development and the ham contributes protein for muscle repair after physical activity.',
      kidScript: '"The brown bread keeps your energy going all afternoon — you won\'t feel hungry or tired before home time."',
      nutrients: [
        { name: 'Complex carbohydrates', source: 'from the wholegrain roll', benefit: 'give you long-lasting energy without a crash' },
        { name: 'Calcium',               source: 'from the cheese',          benefit: 'builds strong bones while you\'re still growing' },
        { name: 'Protein',               source: 'from the ham and cheese',  benefit: 'helps muscles grow and repair after activity' },
      ],
      alternative: 'Cheese and tomato roll',
    },
    side: {
      name: 'Cherry tomatoes',
      teacherNote: 'Cherry tomatoes are naturally sweet, need no preparation, and are rich in vitamin C and lycopene — an antioxidant that protects the body\'s cells. They travel well and are easy to eat without making a mess.',
      kidScript: '"These give your immune system a boost — like a little shield that helps your body fight off bugs."',
      nutrients: [
        { name: 'Vitamin C', source: 'from the tomato',                      benefit: 'helps your body fight off illness' },
        { name: 'Lycopene',  source: 'from the red colour of the tomato',    benefit: 'protects your body\'s cells from damage' },
        { name: 'Potassium', source: 'from the tomato',                      benefit: 'helps your heart and muscles work well' },
      ],
      alternative: 'Pepper strips',
    },
    snack: {
      name: 'Natural yogurt pot',
      teacherNote: 'Yogurt is one of the better sources of calcium outside of milk, and the live cultures it contains support gut health — which has a measurable effect on mood, energy, and immune function. Filling, familiar, and easy for children to enjoy.',
      kidScript: '"The good bacteria in this help your tummy work well — and a happy tummy helps you feel better all round."',
      nutrients: [
        { name: 'Calcium',       source: 'from the milk in the yogurt',  benefit: 'builds strong bones and teeth' },
        { name: 'Protein',       source: 'from the milk in the yogurt',  benefit: 'keeps you full and helps your body grow' },
        { name: 'Live cultures', source: 'naturally in the yogurt',      benefit: 'keep your tummy healthy and comfortable' },
      ],
      alternative: 'A small portion of cheese',
    },
    drink: {
      name: 'Water',
      teacherNote: 'The body often confuses mild thirst for hunger. Staying well hydrated keeps children more physically comfortable and mentally focused, and helps regulate body temperature during and after physical activity.',
      kidScript: '"Water keeps your brain sharp and your body comfortable — especially after running around outside."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Chilled herbal tea (no sugar)',
    },
  },
  {
    id: 4,
    main: {
      name: 'Egg salad sandwich on wholegrain bread',
      teacherNote: 'Eggs are one of the most nutritionally complete foods available — protein, vitamin D, choline, and B12 in a single package. Choline in particular supports brain development and concentration, making eggs an excellent choice for a school lunch.',
      kidScript: '"Eggs have almost everything your brain and body need — they\'re one of the best things you can eat."',
      nutrients: [
        { name: 'Choline',   source: 'from the egg yolk',  benefit: 'helps your brain concentrate and remember things' },
        { name: 'Protein',   source: 'from the egg white', benefit: 'keeps you full and helps your body grow strong' },
        { name: 'Vitamin D', source: 'from the egg yolk',  benefit: 'helps your bones grow and keeps your mood steady' },
      ],
      alternative: 'Chicken salad sandwich',
    },
    side: {
      name: 'Grapes',
      teacherNote: 'Grapes are naturally sweet, need no preparation, and travel without damage. Natural sugars give a quick energy lift, and antioxidants help protect the body\'s cells from everyday wear and tear. A genuinely convenient and nutritious option.',
      kidScript: '"These give you a quick, natural energy burst — the good kind that doesn\'t make you feel strange afterwards."',
      nutrients: [
        { name: 'Vitamin C',      source: 'from the grape skin',            benefit: 'helps your immune system stay strong' },
        { name: 'Antioxidants',   source: 'from the dark colour of grapes', benefit: 'protect your body\'s cells from damage' },
        { name: 'Natural sugars', source: 'from the grapes',                benefit: 'give you a quick energy lift when you need it' },
      ],
      alternative: 'Blueberries',
    },
    snack: {
      name: 'Oat bar (low sugar)',
      teacherNote: 'Oats are a slow-burning carbohydrate that maintain steady blood sugar — helping children avoid the energy crash that often hits mid-afternoon. A low-sugar oat bar provides this effect without the downsides of high-sugar snacks.',
      kidScript: '"This keeps your energy steady so you don\'t hit a wall and feel tired before the end of school."',
      nutrients: [
        { name: 'Fibre',                  source: 'from the oats', benefit: 'helps your tummy feel full and comfortable' },
        { name: 'Complex carbohydrates',  source: 'from the oats', benefit: 'give you slow, steady energy that lasts' },
        { name: 'Iron',                   source: 'from the oats', benefit: 'helps your blood carry energy around your body' },
      ],
      alternative: 'Rice cakes with a nut-free spread',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Water supports every system in the body — from joint lubrication to temperature regulation to brain function. The most straightforward and effective choice for children during the school day.',
      kidScript: '"Water keeps your brain sharp, your joints comfy, and your energy steady — it\'s the best thing for a busy day."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Coconut water (no added sugar)',
    },
  },
  {
    id: 5,
    main: {
      name: 'Turkey and salad pitta pocket',
      teacherNote: 'Turkey is one of the leanest sources of protein available. B vitamins support energy metabolism, and selenium helps the immune system function properly. A pitta pocket holds together well and is easy for children to eat without mess.',
      kidScript: '"This keeps you full and gives you the energy your body needs to learn and move all afternoon."',
      nutrients: [
        { name: 'Protein',    source: 'from the turkey',          benefit: 'keeps you full and helps your muscles grow' },
        { name: 'Selenium',   source: 'from the turkey',          benefit: 'helps your immune system work properly' },
        { name: 'B vitamins', source: 'from the turkey and pitta', benefit: 'help turn your food into energy your body can use' },
      ],
      alternative: 'Chicken and salad pitta',
    },
    side: {
      name: 'Red pepper strips',
      teacherNote: 'Red peppers contain more vitamin C than oranges — a fact most adults find surprising. Naturally sweet, satisfying to crunch on, and rich in vitamin A for eyesight. An excellent option that children tend to enjoy.',
      kidScript: '"These actually have more vitamin C than an orange — brilliant for keeping you from getting sick."',
      nutrients: [
        { name: 'Vitamin C',   source: 'from the red pepper',            benefit: 'helps your immune system stay strong' },
        { name: 'Vitamin A',   source: 'from the colour of the pepper',  benefit: 'helps your eyes see well' },
        { name: 'Antioxidants', source: 'from the pepper',               benefit: 'protect your body\'s cells' },
      ],
      alternative: 'Sugar snap peas',
    },
    snack: {
      name: 'Orange segments',
      teacherNote: 'Oranges provide a reliable source of vitamin C and folate. They also help the body absorb iron from other foods eaten at the same meal — a small detail that makes a real difference to how children feel across the afternoon.',
      kidScript: '"These give your immune system a boost and also help your body use the iron in the rest of your lunch."',
      nutrients: [
        { name: 'Vitamin C', source: 'from the orange flesh', benefit: 'keeps your immune system strong' },
        { name: 'Folate',    source: 'from the orange',       benefit: 'helps your body\'s cells develop properly' },
        { name: 'Fibre',     source: 'from the orange',       benefit: 'helps your tummy feel comfortable' },
      ],
      alternative: 'Satsuma or clementine',
    },
    drink: {
      name: 'Semi-skimmed milk',
      teacherNote: 'A carton of milk at lunchtime is one of the most efficient ways to meet a child\'s daily calcium requirements. B12 supports the nervous system and helps keep energy levels stable through the afternoon.',
      kidScript: '"This builds strong bones and teeth — your body is still growing and this is exactly what it needs right now."',
      nutrients: [
        { name: 'Calcium',    source: 'from the milk', benefit: 'builds strong bones and teeth' },
        { name: 'Protein',    source: 'from the milk', benefit: 'keeps you full and supports healthy growth' },
        { name: 'Vitamin B12', source: 'from the milk', benefit: 'keeps your energy steady and your nerves healthy' },
      ],
      alternative: 'Fortified plant milk',
    },
  },
  {
    id: 6,
    main: {
      name: 'Salmon and cucumber sandwich',
      teacherNote: 'Salmon is one of the richest dietary sources of omega-3 fatty acids, which directly feed brain cells and support memory and concentration. Vitamin D supports mood and bone development. One of the best lunches available for children who need to take information in and retain it.',
      kidScript: '"The good fats in salmon feed your brain — they help you remember things and stay focused."',
      nutrients: [
        { name: 'Omega-3 fats', source: 'from the salmon', benefit: 'help your brain think clearly and remember' },
        { name: 'Protein',      source: 'from the salmon', benefit: 'keeps you full and helps muscles recover' },
        { name: 'Vitamin D',    source: 'from the salmon', benefit: 'supports your bones and helps your mood' },
      ],
      alternative: 'Tuna and cucumber sandwich',
    },
    side: {
      name: 'Sugar snap peas',
      teacherNote: 'Sugar snap peas are naturally sweet, crunchy, and eaten whole with no preparation. They provide fibre for digestion, vitamin C for immunity, and plant protein that adds to the nutritional quality of the overall meal.',
      kidScript: '"These are naturally sweet and crunchy — and they help your tummy digest your lunch properly."',
      nutrients: [
        { name: 'Vitamin C',     source: 'from the pea pod', benefit: 'helps your body fight off illness' },
        { name: 'Fibre',         source: 'from the pea pod', benefit: 'helps your digestion work comfortably' },
        { name: 'Plant protein', source: 'from the peas',    benefit: 'helps your body grow and repair itself' },
      ],
      alternative: 'Edamame beans',
    },
    snack: {
      name: 'Blueberries',
      teacherNote: 'Blueberries are consistently rated among the best foods for brain health. Their antioxidants protect brain cells from damage, and vitamin C and fibre make them a genuinely effective snack for focus and sustained energy.',
      kidScript: '"These are one of the best things you can eat for your brain — the antioxidants protect your brain cells."',
      nutrients: [
        { name: 'Antioxidants', source: 'from the blue colour of blueberries', benefit: 'protect your brain cells from damage' },
        { name: 'Vitamin C',    source: 'from the blueberries',                benefit: 'helps your immune system stay strong' },
        { name: 'Fibre',        source: 'from the blueberry skin',             benefit: 'helps your tummy feel comfortable' },
      ],
      alternative: 'Raspberries or strawberries',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Children are more sensitive to the effects of dehydration than adults. Even a small drop in hydration affects mood, concentration, and physical comfort. Water is the most effective remedy and should be accessible throughout the day.',
      kidScript: '"Water keeps your brain working well — even being a little bit thirsty can make you feel tired or grumpy."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Sparkling water (no flavouring)',
    },
  },
  {
    id: 7,
    main: {
      name: 'Cheese and tomato quesadilla',
      teacherNote: 'A quesadilla works well cold, holds together better than a sandwich, and is familiar and filling. Calcium from the cheese supports bone development, carbohydrates from the wrap sustain energy, and lycopene from the tomato provides antioxidant protection.',
      kidScript: '"This keeps your energy going and gives your bones what they need to grow strong."',
      nutrients: [
        { name: 'Calcium',               source: 'from the cheese',              benefit: 'builds strong bones and teeth' },
        { name: 'Complex carbohydrates',  source: 'from the wrap',               benefit: 'give you steady energy all afternoon' },
        { name: 'Lycopene',              source: 'from the tomato',              benefit: 'protects your body\'s cells from damage' },
      ],
      alternative: 'Cheese and spinach wrap',
    },
    side: {
      name: 'Broccoli florets',
      teacherNote: 'Broccoli is among the most nutrient-dense vegetables children can eat. Small florets are easy to snack on and provide vitamin C, vitamin K, and folate in a small portion. A little goes a very long way nutritionally.',
      kidScript: '"These are one of the most packed vegetables around — a small bit gives your body a huge amount of good stuff."',
      nutrients: [
        { name: 'Vitamin C', source: 'from the broccoli', benefit: 'helps your immune system fight illness' },
        { name: 'Vitamin K', source: 'from the broccoli', benefit: 'helps your blood clot and bones stay strong' },
        { name: 'Folate',    source: 'from the broccoli', benefit: 'helps your body\'s cells develop properly' },
      ],
      alternative: 'Cauliflower florets',
    },
    snack: {
      name: 'Raisins (small box)',
      teacherNote: 'A small box of raisins is portable, naturally sweet, and provides iron without the refined sugar that causes energy spikes and crashes. Iron supports healthy blood and helps children feel alert rather than fatigued during the afternoon.',
      kidScript: '"These give you a sweet energy lift without the crash — and iron in them helps you feel less tired."',
      nutrients: [
        { name: 'Iron',           source: 'from the raisins', benefit: 'helps your blood carry energy around your body' },
        { name: 'Fibre',          source: 'from the raisins', benefit: 'helps your tummy feel comfortable and full' },
        { name: 'Natural sugars', source: 'from the raisins', benefit: 'give you a quick energy lift when you need it' },
      ],
      alternative: 'Dried apricots (unsulphured)',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Good hydration supports energy regulation throughout the entire day. Children who drink consistently during school hours are more comfortable, better focused, and less prone to the afternoon tiredness that affects classroom performance.',
      kidScript: '"Water keeps your brain and body going strong all the way to home time."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Unsweetened coconut water',
    },
  },
  {
    id: 8,
    main: {
      name: 'Hummus and roasted vegetable wrap',
      teacherNote: 'Hummus is made from chickpeas — one of the best plant-based sources of protein and fibre. It digests slowly, keeping children full without feeling heavy. Iron from chickpeas is particularly valuable for alertness, as low iron is one of the most common causes of fatigue in school-age children.',
      kidScript: '"This keeps you full without making you feel heavy — and iron in it helps you stay awake and alert."',
      nutrients: [
        { name: 'Plant protein', source: 'from the chickpeas in hummus',     benefit: 'helps your body grow and keeps you full' },
        { name: 'Fibre',         source: 'from the chickpeas and vegetables', benefit: 'helps your tummy feel comfortable and full' },
        { name: 'Iron',          source: 'from the chickpeas',               benefit: 'helps you stay awake and focused rather than tired' },
      ],
      alternative: 'Hummus and chicken wrap',
    },
    side: {
      name: 'Celery sticks',
      teacherNote: 'Celery is mostly water, quietly supporting hydration alongside whatever the child is drinking. Very low in sugar and easy on the stomach — a good option for children who feel uncomfortable after eating.',
      kidScript: '"These help keep you hydrated — your body gets water from food too, not just drinks."',
      nutrients: [
        { name: 'Vitamin K',     source: 'from the celery', benefit: 'helps your bones stay strong' },
        { name: 'Folate',        source: 'from the celery', benefit: 'helps your body\'s cells develop properly' },
        { name: 'Water content', source: 'from the celery', benefit: 'keeps you hydrated throughout the day' },
      ],
      alternative: 'Carrot sticks',
    },
    snack: {
      name: 'Strawberries',
      teacherNote: 'Strawberries are one of the best fruit sources of vitamin C and provide natural energy without the crash associated with processed sweet snacks. Antioxidants support immune function, and their natural sweetness makes them a popular option with children.',
      kidScript: '"These are sweet and good for you — vitamin C helps your body stay healthy and gives you natural energy."',
      nutrients: [
        { name: 'Vitamin C',    source: 'from the strawberry',                        benefit: 'helps your body stay healthy and fight illness' },
        { name: 'Antioxidants', source: 'from the red colour of the strawberry',      benefit: 'protect your body\'s cells' },
        { name: 'Fibre',        source: 'from the strawberry',                        benefit: 'helps your tummy feel comfortable' },
      ],
      alternative: 'Raspberries',
    },
    drink: {
      name: 'Semi-skimmed milk',
      teacherNote: 'Milk provides calcium, protein, vitamin D, and vitamin B12 in one carton. Especially valuable during the years when bones and muscles are actively developing — a small habit with a big long-term effect.',
      kidScript: '"This builds strong bones, healthy muscles, and keeps your energy steady all afternoon."',
      nutrients: [
        { name: 'Calcium',   source: 'from the milk',     benefit: 'builds strong bones and teeth' },
        { name: 'Protein',   source: 'from the milk',     benefit: 'keeps you full and helps your muscles grow' },
        { name: 'Vitamin D', source: 'added to the milk', benefit: 'helps your body absorb calcium and supports your mood' },
      ],
      alternative: 'Calcium-fortified oat milk',
    },
  },
  {
    id: 9,
    main: {
      name: 'Bean and cheese burrito wrap',
      teacherNote: 'This is a filling main that provides slow, steady energy through the afternoon. The beans help children stay full and focused, while iron supports alertness and reduces tiredness later in the day.',
      kidScript: '"This helps your energy last all afternoon so you\'re not tired or hungry before home time."',
      nutrients: [
        { name: 'Protein', source: 'from the beans and cheese', benefit: 'helps your body grow strong' },
        { name: 'Fibre',   source: 'from the beans and wrap',   benefit: 'helps your tummy feel happy' },
        { name: 'Iron',    source: 'from the beans',            benefit: 'helps your brain stay awake and ready to learn' },
      ],
      alternative: 'Chicken and bean wrap',
    },
    side: {
      name: 'Sweetcorn',
      teacherNote: 'Sweetcorn adds fibre for digestion and carbohydrates for energy, helping children feel comfortable after lunch and ready to move and learn. B vitamins and magnesium support muscle and nerve function — useful for children who are active throughout the day.',
      kidScript: '"This gives you energy to move, play, and still feel good sitting on the carpet after lunch."',
      nutrients: [
        { name: 'Fibre',     source: 'from the sweetcorn', benefit: 'helps food move through your tummy comfortably' },
        { name: 'B vitamins', source: 'from the sweetcorn', benefit: 'help turn food into energy' },
        { name: 'Magnesium', source: 'from the sweetcorn', benefit: 'helps your muscles work properly' },
      ],
      alternative: 'Edamame beans',
    },
    snack: {
      name: 'Dried apricots',
      teacherNote: 'A naturally sweet snack that provides iron and vitamin A. It gives a gentle energy lift without causing the quick spike and crash that sugary snacks can bring. Particularly helpful for children who feel tired during the afternoon.',
      kidScript: '"This gives you a little energy boost without making you feel jumpy or tired later."',
      nutrients: [
        { name: 'Iron',      source: 'from the dried apricots',              benefit: 'helps you feel less tired and more alert' },
        { name: 'Vitamin A', source: 'from the orange colour of apricots',   benefit: 'helps your eyes see well' },
        { name: 'Fibre',     source: 'from the apricots',                    benefit: 'helps your tummy feel comfortable' },
      ],
      alternative: 'Sultanas',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Water supports concentration, digestion, and temperature control. It\'s especially important after physical activity or outdoor play. Children should be encouraged to drink regularly rather than waiting until they feel thirsty.',
      kidScript: '"Water helps your brain think clearly and helps your body cool down after running around."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Diluted fruit juice (no added sugar)',
    },
  },
  {
    id: 10,
    main: {
      name: 'Roast beef and salad roll',
      teacherNote: 'Beef is one of the richest natural sources of iron and zinc. Even a small amount provides protein for muscle repair, iron to prevent fatigue, and B12 to support the nervous system. Low iron is one of the most common reasons children feel tired and find it hard to concentrate.',
      kidScript: '"Iron in beef helps your blood carry energy around your body — that\'s why it makes you feel less tired."',
      nutrients: [
        { name: 'Iron',        source: 'from the beef', benefit: 'helps you feel alert and less tired' },
        { name: 'Protein',     source: 'from the beef', benefit: 'keeps you full and helps muscles grow' },
        { name: 'Vitamin B12', source: 'from the beef', benefit: 'supports your nervous system and energy' },
      ],
      alternative: 'Chicken and salad roll',
    },
    side: {
      name: 'Mixed salad leaves',
      teacherNote: 'A handful of mixed leaves adds a range of vitamins to a meal without significantly changing what the child is eating. Vitamin K supports bone health, folate supports cell development, and vitamin C provides immune support. Simple and effective.',
      kidScript: '"These add vitamins to your lunch without you even noticing — a small bit goes a long way."',
      nutrients: [
        { name: 'Vitamin K', source: 'from the dark green leaves', benefit: 'helps your bones stay strong' },
        { name: 'Folate',    source: 'from the leaves',            benefit: 'helps your body\'s cells develop properly' },
        { name: 'Vitamin C', source: 'from the leaves',            benefit: 'gives your immune system a useful boost' },
      ],
      alternative: 'Sliced cucumber and tomato',
    },
    snack: {
      name: 'Melon chunks',
      teacherNote: 'Melon is refreshing, naturally sweet, and has a high water content — a good choice for hydration as well as nutrition. Vitamin C and vitamin A provide immune and eyesight support, and the gentle sweetness makes it easy for children to enjoy.',
      kidScript: '"These are refreshing and hydrating — they also give you a gentle energy lift without a crash."',
      nutrients: [
        { name: 'Vitamin C',     source: 'from the melon',           benefit: 'helps your body stay healthy' },
        { name: 'Vitamin A',     source: 'from the orange colour',   benefit: 'helps your eyes see well' },
        { name: 'Water content', source: 'from the melon',           benefit: 'helps keep you hydrated in the afternoon' },
      ],
      alternative: 'Mango chunks',
    },
    drink: {
      name: 'Water',
      teacherNote: 'How well a child can concentrate is directly linked to how hydrated they are. Consistent hydration throughout the school day prevents the tiredness and irritability that often affects afternoon classes.',
      kidScript: '"Water helps your brain stay sharp and stops you feeling tired or irritable in the afternoon."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Chilled mint water',
    },
  },
  {
    id: 11,
    main: {
      name: 'Tuna pasta salad',
      teacherNote: 'Pasta provides long-lasting energy through complex carbohydrates, and tuna adds omega-3 fats that directly support brain function. Together they create a filling, brain-friendly meal that travels well and is easy to eat cold.',
      kidScript: '"The pasta gives you lasting energy and the tuna feeds your brain — it\'s a brilliant combo."',
      nutrients: [
        { name: 'Complex carbohydrates', source: 'from the pasta', benefit: 'give you long-lasting energy all afternoon' },
        { name: 'Omega-3 fats',          source: 'from the tuna',  benefit: 'help your brain think and remember clearly' },
        { name: 'Protein',               source: 'from the tuna',  benefit: 'keeps you full and helps muscles recover' },
      ],
      alternative: 'Chicken pasta salad',
    },
    side: {
      name: 'Edamame beans',
      teacherNote: 'Edamame are one of the only plant foods that contain complete protein — meaning every essential amino acid the body needs. They also contain iron and calcium, making them a nutritionally exceptional option that needs no preparation.',
      kidScript: '"These are one of the only plants with complete protein — everything your body needs to build and repair itself."',
      nutrients: [
        { name: 'Complete protein', source: 'from the edamame beans', benefit: 'helps your body grow and repair itself fully' },
        { name: 'Iron',             source: 'from the beans',          benefit: 'helps you feel alert and energetic' },
        { name: 'Calcium',          source: 'from the beans',          benefit: 'helps your bones stay strong' },
      ],
      alternative: 'Roasted chickpeas',
    },
    snack: {
      name: 'Rice cakes with soft cheese',
      teacherNote: 'Rice cakes are light, low in sugar, and easy to eat. The soft cheese adds protein and calcium that complement the carbohydrates in the rice cake, providing a gentle, sustained energy top-up rather than a spike.',
      kidScript: '"These give you a gentle energy top-up — light enough not to make you feel heavy but filling enough to keep you going."',
      nutrients: [
        { name: 'Carbohydrates', source: 'from the rice cake',   benefit: 'give you steady energy' },
        { name: 'Calcium',       source: 'from the soft cheese', benefit: 'builds strong bones and teeth' },
        { name: 'Protein',       source: 'from the soft cheese', benefit: 'keeps you full and helps your body grow' },
      ],
      alternative: 'Oatcakes with hummus',
    },
    drink: {
      name: 'Semi-skimmed milk',
      teacherNote: 'Alongside a protein-rich meal, milk helps children cover their daily calcium requirements in one sitting. B vitamins support steady energy and a healthy nervous system throughout the rest of the afternoon.',
      kidScript: '"This builds strong bones, keeps your energy going, and works really well alongside this kind of lunch."',
      nutrients: [
        { name: 'Calcium',    source: 'from the milk', benefit: 'builds strong bones and teeth' },
        { name: 'Protein',    source: 'from the milk', benefit: 'keeps you full and supports healthy growth' },
        { name: 'B vitamins', source: 'from the milk', benefit: 'keep your energy steady and your nerves healthy' },
      ],
      alternative: 'Fortified soya milk',
    },
  },
  {
    id: 12,
    main: {
      name: 'Ham and cheese panini (cold)',
      teacherNote: 'A panini holds together better than a sandwich when eaten cold and is genuinely filling. Calcium from the cheese supports bone development, protein from the ham aids muscle repair, and carbohydrates from the bread provide sustained energy through the afternoon.',
      kidScript: '"This gives you lasting energy from the bread and strong-bone support from the cheese."',
      nutrients: [
        { name: 'Protein',       source: 'from the ham and cheese', benefit: 'keeps you full and helps muscles repair' },
        { name: 'Calcium',       source: 'from the cheese',         benefit: 'builds strong bones and teeth' },
        { name: 'Carbohydrates', source: 'from the panini bread',   benefit: 'give you lasting energy through the afternoon' },
      ],
      alternative: 'Cheese and tomato panini',
    },
    side: {
      name: 'Cucumber ribbons',
      teacherNote: 'Presenting cucumber as ribbons rather than slices can make it more visually appealing to children. Cucumber is mostly water, quietly supporting hydration, and is very easy on the stomach. A small, effective addition to any lunchbox.',
      kidScript: '"These help keep you hydrated — and the way they\'re cut makes them more fun to eat."',
      nutrients: [
        { name: 'Vitamin K',     source: 'from the cucumber', benefit: 'helps your bones stay strong' },
        { name: 'Potassium',     source: 'from the cucumber', benefit: 'helps your muscles and heart work properly' },
        { name: 'Water content', source: 'from the cucumber', benefit: 'keeps you hydrated throughout the day' },
      ],
      alternative: 'Courgette sticks',
    },
    snack: {
      name: 'Mixed berries',
      teacherNote: 'A mix of berries provides a variety of antioxidants and vitamins in a small portion. The combination supports immune function, protects brain cells from oxidative stress, and provides natural energy without the crash from processed sweet snacks.',
      kidScript: '"Different coloured berries have different vitamins — a mix means your body gets more of everything."',
      nutrients: [
        { name: 'Vitamin C',    source: 'from the berries',                benefit: 'helps your immune system stay strong' },
        { name: 'Antioxidants', source: 'from the colour of each berry',   benefit: 'protect your brain and body\'s cells' },
        { name: 'Fibre',        source: 'from the berry skins',            benefit: 'helps your tummy feel comfortable' },
      ],
      alternative: 'Kiwi slices',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Plain water is the single most effective drink for children during the school day. No sugar, no calories, no downsides. Consistent hydration supports concentration, digestion, and physical comfort from morning through to the final bell.',
      kidScript: '"Water is the best thing for a busy day — it keeps your brain and body working well right to the end."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Infused water with cucumber or lemon',
    },
  },
  {
    id: 13,
    main: {
      name: 'Chicken and avocado sandwich',
      teacherNote: 'Avocado contains monounsaturated fats that directly support brain function and sustained cognitive performance. Paired with protein from chicken, this sandwich provides both short and long-term energy alongside potassium for healthy muscle function.',
      kidScript: '"The healthy fats in avocado feed your brain — they help you think clearly and stay focused."',
      nutrients: [
        { name: 'Healthy fats', source: 'from the avocado', benefit: 'help your brain work at its best' },
        { name: 'Protein',      source: 'from the chicken', benefit: 'keeps you full and helps your muscles grow' },
        { name: 'Potassium',    source: 'from the avocado', benefit: 'helps your muscles and heart work well' },
      ],
      alternative: 'Chicken and hummus sandwich',
    },
    side: {
      name: 'Cherry tomatoes',
      teacherNote: 'Cherry tomatoes are naturally sweet, need no preparation, and provide vitamin C and lycopene in a portable package. Lycopene is an antioxidant that protects the body\'s cells, and potassium supports cardiovascular health.',
      kidScript: '"These protect your body\'s cells and give your immune system a useful boost."',
      nutrients: [
        { name: 'Vitamin C', source: 'from the tomato flesh',                  benefit: 'helps your body fight off illness' },
        { name: 'Lycopene',  source: 'from the red colour of the tomato',      benefit: 'protects your body\'s cells from damage' },
        { name: 'Potassium', source: 'from the tomato',                        benefit: 'keeps your heart and muscles healthy' },
      ],
      alternative: 'Grapes',
    },
    snack: {
      name: 'Kiwi (sliced in half to scoop)',
      teacherNote: 'Kiwi contains more vitamin C per gram than most citrus fruits and is also rich in vitamin K and folate. Halved and scooped with a spoon, it is an engaging, mess-controlled snack. Folate supports brain development — important during growth years.',
      kidScript: '"Kiwi has more vitamin C than an orange — scoop it like a little bowl and your brain will thank you."',
      nutrients: [
        { name: 'Vitamin C', source: 'from the kiwi flesh', benefit: 'helps your immune system stay strong' },
        { name: 'Vitamin K', source: 'from the kiwi',       benefit: 'helps your blood and bones work properly' },
        { name: 'Folate',    source: 'from the kiwi',       benefit: 'helps your brain develop and your cells grow' },
      ],
      alternative: 'Orange segments',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Water is the most effective way to maintain hydration and mental readiness, particularly during the second half of the school day when concentration naturally starts to dip.',
      kidScript: '"Water keeps your brain and body ready for whatever the afternoon brings."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Sparkling water with a slice of lemon',
    },
  },
  {
    id: 14,
    main: {
      name: 'Cheese and salad wholegrain sandwich',
      teacherNote: 'A reliable and nutritious main. Wholegrain bread releases energy slowly, keeping children fuelled through the afternoon. Calcium from the cheese is essential for bone development during the growth years, and protein keeps hunger at bay without making children feel heavy.',
      kidScript: '"The wholegrain bread keeps your energy steady all afternoon — you won\'t feel tired before home time."',
      nutrients: [
        { name: 'Complex carbohydrates', source: 'from the wholegrain bread', benefit: 'give you slow, steady energy that lasts' },
        { name: 'Calcium',               source: 'from the cheese',           benefit: 'builds strong bones and teeth' },
        { name: 'Protein',               source: 'from the cheese',           benefit: 'keeps you full and helps your body grow' },
      ],
      alternative: 'Cream cheese and cucumber sandwich',
    },
    side: {
      name: 'Sugar snap peas',
      teacherNote: 'Sugar snap peas are eaten whole, need no preparation, and are naturally sweet and crunchy — qualities that tend to make them appealing to children. Vitamin C for immunity, fibre for digestion, and plant protein add to the overall meal quality.',
      kidScript: '"These are naturally sweet and crunchy — and they give your immune system a useful boost."',
      nutrients: [
        { name: 'Vitamin C',     source: 'from the pea pod', benefit: 'helps your body fight off illness' },
        { name: 'Fibre',         source: 'from the pea pod', benefit: 'helps your digestion work comfortably' },
        { name: 'Plant protein', source: 'from the peas',    benefit: 'adds to the protein in your whole meal' },
      ],
      alternative: 'Carrot sticks',
    },
    snack: {
      name: 'Fruit salad pot',
      teacherNote: 'A mix of seasonal fruit provides a broader range of vitamins than any single fruit can offer. Natural sugars provide energy without a crash, fibre supports digestion, and the variety of antioxidants supports immune function and cell protection through the afternoon.',
      kidScript: '"Different fruits have different vitamins — a mix means you\'re getting more good stuff in one go."',
      nutrients: [
        { name: 'Vitamin C',    source: 'from the fruit mix',            benefit: 'helps your immune system stay strong' },
        { name: 'Fibre',        source: 'from the fruit skins and flesh', benefit: 'helps your tummy feel comfortable' },
        { name: 'Antioxidants', source: 'from the colour of each fruit', benefit: 'protect your body\'s cells' },
      ],
      alternative: 'Sliced banana and grapes',
    },
    drink: {
      name: 'Water',
      teacherNote: 'Consistent hydration throughout the school day helps children stay focused, feel physically comfortable, and maintain steady energy. The simplest and most accessible tool available to support classroom performance.',
      kidScript: '"Water keeps you focused, comfortable, and energetic — it\'s the best choice every single day."',
      nutrients: [
        { name: 'Hydration', source: 'from the water', benefit: 'helps everything in your body work properly' },
      ],
      alternative: 'Unsweetened diluted fruit juice',
    },
  },
];

/** Returns the same lunchbox for the entire calendar day, rotating through the full list. */
export function getDailyLunchbox(): DailyLunchbox {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return LUNCHBOXES[dayOfYear % LUNCHBOXES.length];
}
