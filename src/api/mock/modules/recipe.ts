/*
 * @Description: 菜谱相关Mock数据
 */
import { defineMock } from '@alova/mock'

// 菜谱分类数据
const categories = [
  { id: 1, name: '家常菜', icon: '🏠', description: '简单易做的家常美味' },
  { id: 2, name: '川菜', icon: '🌶️', description: '麻辣鲜香的川式料理' },
  { id: 3, name: '粤菜', icon: '🦐', description: '清淡鲜美的广式佳肴' },
  { id: 4, name: '湘菜', icon: '🔥', description: '香辣下饭的湖南风味' },
  { id: 5, name: '素食', icon: '🥬', description: '健康营养的素食料理' },
  { id: 6, name: '甜品', icon: '🍰', description: '精致美味的甜品制作' },
]

// 菜谱数据
const recipes = [
  {
    id: 1,
    title: '红烧肉',
    category_id: 1,
    category: '家常菜',
    cover_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20braised%20pork%20belly%20in%20soy%20sauce%2C%20glossy%20red%20color%2C%20appetizing%20food%20photography&image_size=square',
    description: '肥而不腻，入口即化的经典红烧肉',
    ingredients: [
      { name: '五花肉', amount: '500g' },
      { name: '生抽', amount: '3勺' },
      { name: '老抽', amount: '1勺' },
      { name: '冰糖', amount: '30g' },
      { name: '料酒', amount: '2勺' },
      { name: '葱', amount: '2根' },
      { name: '姜', amount: '3片' },
    ],
    steps: [
      '五花肉切块，冷水下锅焯水去腥',
      '热锅下肉块，煎至表面微黄',
      '加入冰糖炒糖色',
      '倒入生抽、老抽、料酒调色',
      '加入热水没过肉块，大火烧开',
      '转小火炖煮40分钟',
      '大火收汁即可',
    ],
    cooking_time: 60,
    difficulty: '简单',
    tips: '炒糖色时火候要掌握好，避免炒糊。收汁时要不断翻动，让每块肉都裹上糖色。',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: '麻婆豆腐',
    category_id: 2,
    category: '川菜',
    cover_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=spicy%20mapo%20tofu%20with%20minced%20meat%2C%20red%20chili%20oil%2C%20Sichuan%20cuisine%2C%20appetizing%20food%20photography&image_size=square',
    description: '麻辣鲜香，嫩滑爽口的经典川菜',
    ingredients: [
      { name: '嫩豆腐', amount: '400g' },
      { name: '猪肉末', amount: '100g' },
      { name: '豆瓣酱', amount: '2勺' },
      { name: '花椒粉', amount: '1勺' },
      { name: '生抽', amount: '1勺' },
      { name: '葱花', amount: '适量' },
      { name: '蒜末', amount: '2瓣' },
    ],
    steps: [
      '豆腐切块，用盐水焯一下',
      '热锅下肉末炒散',
      '加入豆瓣酱炒出红油',
      '倒入豆腐块轻轻翻炒',
      '加水焖煮5分钟',
      '用水淀粉勾芡',
      '撒上花椒粉和葱花即可',
    ],
    cooking_time: 20,
    difficulty: '简单',
    tips: '豆腐要选用嫩豆腐，焯水可以去除豆腥味。炒制时动作要轻，避免把豆腐炒碎。',
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z',
  },
  {
    id: 3,
    title: '白切鸡',
    category_id: 3,
    category: '粤菜',
    cover_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20white%20cut%20chicken%2C%20tender%20sliced%20chicken%2C%20ginger%20scallion%20sauce%2C%20elegant%20presentation&image_size=square',
    description: '鸡肉鲜嫩，蘸料香浓的粤式经典',
    ingredients: [
      { name: '土鸡', amount: '1只' },
      { name: '生姜', amount: '50g' },
      { name: '小葱', amount: '3根' },
      { name: '生抽', amount: '3勺' },
      { name: '香油', amount: '1勺' },
      { name: '盐', amount: '适量' },
    ],
    steps: [
      '整鸡洗净，冷水下锅',
      '水开后转小火煮20分钟',
      '关火焖10分钟',
      '捞起过冰水定型',
      '制作姜葱蘸料',
      '鸡肉切块装盘',
      '配蘸料食用',
    ],
    cooking_time: 45,
    difficulty: '中等',
    tips: '煮鸡时要保持小火，避免鸡皮破裂。过冰水可以让鸡皮更紧致，口感更好。',
    created_at: '2024-01-13T12:00:00Z',
    updated_at: '2024-01-13T12:00:00Z',
  },
  {
    id: 4,
    title: '土豆丝',
    category_id: 1,
    category: '家常菜',
    cover_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=stir%20fried%20potato%20shreds%2C%20crispy%20golden%20potato%20strips%2C%20home%20cooking%20style&image_size=square',
    description: '爽脆可口的经典家常菜',
    ingredients: [
      { name: '土豆', amount: '2个' },
      { name: '青椒', amount: '1个' },
      { name: '干辣椒', amount: '3个' },
      { name: '蒜', amount: '2瓣' },
      { name: '醋', amount: '1勺' },
      { name: '盐', amount: '适量' },
    ],
    steps: [
      '土豆去皮切丝，用水冲洗淀粉',
      '青椒切丝备用',
      '热锅下蒜爆香',
      '下土豆丝大火炒制',
      '加入青椒丝继续炒',
      '调味出锅',
    ],
    cooking_time: 15,
    difficulty: '简单',
    tips: '土豆丝要切得均匀，用水冲洗可以去除多余淀粉，炒出来更爽脆。',
    created_at: '2024-01-12T18:00:00Z',
    updated_at: '2024-01-12T18:00:00Z',
  },
  {
    id: 5,
    title: '蒸蛋羹',
    category_id: 1,
    category: '家常菜',
    cover_image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=smooth%20steamed%20egg%20custard%2C%20silky%20texture%2C%20garnished%20with%20scallions%2C%20comfort%20food&image_size=square',
    description: '嫩滑如丝的营养蒸蛋',
    ingredients: [
      { name: '鸡蛋', amount: '3个' },
      { name: '温水', amount: '150ml' },
      { name: '盐', amount: '少许' },
      { name: '香油', amount: '几滴' },
      { name: '葱花', amount: '适量' },
    ],
    steps: [
      '鸡蛋打散，加盐调味',
      '加入温水搅拌均匀',
      '过筛去除泡沫',
      '盖上保鲜膜，扎几个小孔',
      '水开后蒸10分钟',
      '出锅撒葱花，滴香油',
    ],
    cooking_time: 20,
    difficulty: '简单',
    tips: '蛋液和水的比例是1:1，过筛可以让蒸蛋更嫩滑。保鲜膜可以防止水汽滴落。',
    created_at: '2024-01-11T08:00:00Z',
    updated_at: '2024-01-11T08:00:00Z',
  },
]

const mockConfig = [
  // 获取菜谱列表
  {
    url: '/rest/v1/recipes',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const { limit = 20, offset = 0, category_id, or } = query
      let filteredRecipes = [...recipes]

      // 按分类筛选
      if (category_id) {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.category_id === Number.parseInt(category_id))
      }

      // 搜索功能
      if (or) {
        const searchTerm = decodeURIComponent(or.replace(/title\.ilike\.%|ingredients\.ilike\.%/g, '').replace(/%/g, ''))
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.title.includes(searchTerm)
          || recipe.ingredients.some(ingredient => ingredient.name.includes(searchTerm)),
        )
      }

      // 分页
      const start = Number.parseInt(offset)
      const end = start + Number.parseInt(limit)
      const paginatedRecipes = filteredRecipes.slice(start, end)

      return paginatedRecipes
    },
  },

  // 获取菜谱详情
  {
    url: '/rest/v1/recipes',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const { id } = query
      if (id) {
        const recipe = recipes.find(r => r.id === Number.parseInt(id))
        return recipe ? [recipe] : []
      }
      return recipes
    },
  },

  // 获取分类列表
  {
    url: '/rest/v1/categories',
    method: 'get',
    response: () => {
      return categories
    },
  },

  // 获取推荐菜谱
  {
    url: '/rest/v1/recipes/recommended',
    method: 'get',
    response: ({ query }: { query: any }) => {
      const { limit = 6 } = query
      return recipes.slice(0, Number.parseInt(limit))
    },
  },
]

export default defineMock(mockConfig as any)
