export interface SearchResult {
  title: string
  excerpt: string
  url: string
  category: string
  score: number
  type: 'page' | 'section' | 'faq'
}

export interface SearchIndex {
  id: string
  title: string
  content: string
  category: string
  url: string
  type: 'page' | 'section' | 'faq'
  keywords: string[]
}

class DocumentSearch {
  private index: SearchIndex[] = []

  constructor() {
    this.buildIndex()
  }

  private buildIndex() {
    this.index = [
      {
        id: 'getting-started',
        title: 'Bắt đầu sử dụng',
        content: 'Hướng dẫn bắt đầu sử dụng hệ thống chấm công web portal. Yêu cầu hệ thống, truy cập hệ thống.',
        category: 'Bắt đầu',
        url: '/help#bắt-đầu-sử-dụng',
        type: 'section',
        keywords: ['bắt đầu', 'khởi đầu', 'hướng dẫn', 'cài đặt']
      },
      {
        id: 'login-first-time',
        title: 'Đăng nhập lần đầu',
        content: 'Hướng dẫn chi tiết cách đăng nhập vào hệ thống chấm công web portal lần đầu tiên. Nhập thông tin đăng nhập, xác thực.',
        category: 'Xác thực',
        url: '/help#đăng-nhập-lần-đầu',
        type: 'section',
        keywords: ['đăng nhập', 'login', 'xác thực', 'mật khẩu', 'email']
      },
      {
        id: 'forgot-password',
        title: 'Quên mật khẩu',
        content: 'Cách khôi phục mật khẩu khi quên. Reset password thông qua email hoặc SMS.',
        category: 'Xác thực',
        url: '/help#quên-mật-khẩu',
        type: 'section',
        keywords: ['quên mật khẩu', 'reset', 'khôi phục', 'forgot password']
      },
      {
        id: 'dashboard',
        title: 'Trang tổng quan (Dashboard)',
        content: 'Hiển thị thống kê tổng quan, biểu đồ xu hướng, số ngày làm việc, tổng giờ làm, tỷ lệ đúng giờ.',
        category: 'Dashboard',
        url: '/help#trang-tổng-quan-dashboard',
        type: 'section',
        keywords: ['dashboard', 'tổng quan', 'thống kê', 'biểu đồ', 'KPI']
      },
      {
        id: 'locations-management',
        title: 'Quản lý vị trí',
        content: 'Cách thêm, sửa, xóa vị trí công ty trong hệ thống. Chỉ admin mới có quyền thực hiện các thao tác này.',
        category: 'Vị trí',
        url: '/help#quản-lý-vị-trí',
        type: 'section',
        keywords: ['vị trí', 'location', 'địa điểm', 'GPS', 'tọa độ']
      },
      {
        id: 'history-view',
        title: 'Xem lịch sử chấm công',
        content: 'Cách xem lịch sử check-in/out, lọc dữ liệu theo thời gian, tìm kiếm bản ghi.',
        category: 'Lịch sử',
        url: '/help#xem-lịch-sử-chấm-công',
        type: 'section',
        keywords: ['lịch sử', 'history', 'check-in', 'check-out', 'bản ghi']
      },
      {
        id: 'export-reports',
        title: 'Xuất báo cáo',
        content: 'Hướng dẫn xuất báo cáo chấm công dưới dạng Excel hoặc CSV. Chọn khoảng thời gian, định dạng file.',
        category: 'Báo cáo',
        url: '/help#xuất-báo-cáo',
        type: 'section',
        keywords: ['xuất báo cáo', 'export', 'excel', 'csv', 'download']
      },
      {
        id: 'faq-login-issue',
        title: 'Tôi không thể đăng nhập được?',
        content: 'Giải pháp khắc phục khi gặp lỗi đăng nhập, kiểm tra thông tin, reset mật khẩu.',
        category: 'FAQ',
        url: '/help#câu-hỏi-thường-gặp',
        type: 'faq',
        keywords: ['lỗi đăng nhập', 'không vào được', 'troubleshoot']
      },
      {
        id: 'faq-no-data',
        title: 'Tại sao tôi không thấy dữ liệu?',
        content: 'Nguyên nhân và giải pháp khi không thấy dữ liệu chấm công hiển thị.',
        category: 'FAQ',
        url: '/help#câu-hỏi-thường-gặp',
        type: 'faq',
        keywords: ['không có dữ liệu', 'trống', 'không hiển thị']
      },
      {
        id: 'faq-add-location',
        title: 'Làm thế nào để thêm vị trí mới?',
        content: 'Cách thêm vị trí làm việc mới, quyền hạn cần thiết.',
        category: 'FAQ',
        url: '/help#câu-hỏi-thường-gặp',
        type: 'faq',
        keywords: ['thêm vị trí', 'vị trí mới', 'add location']
      }
    ]
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return []

    const lowercaseQuery = query.toLowerCase()
    const words = lowercaseQuery.split(' ').filter(word => word.length > 0)

    return this.index
      .map(item => {
        let score = 0
        const title = item.title.toLowerCase()
        const content = item.content.toLowerCase()
        const category = item.category.toLowerCase()
        const keywords = item.keywords.join(' ').toLowerCase()

        // Exact matches get highest scores
        if (title === lowercaseQuery) score += 10
        if (title.includes(lowercaseQuery)) score += 5

        // Keyword matches
        words.forEach(word => {
          if (title.includes(word)) score += 3
          if (keywords.includes(word)) score += 2
          if (content.includes(word)) score += 1
          if (category.includes(word)) score += 2
        })

        // Partial matches for short queries
        if (lowercaseQuery.length >= 3) {
          const partial = lowercaseQuery.substring(0, 3)
          if (title.includes(partial)) score += 0.5
          if (keywords.includes(partial)) score += 0.3
        }

        // Boost score based on item type
        if (item.type === 'faq' && score > 0) score += 0.5

        return {
          title: item.title,
          excerpt: this.generateExcerpt(item.content, words),
          url: item.url,
          category: item.category,
          score,
          type: item.type
        }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  private generateExcerpt(content: string, searchWords: string[]): string {
    const maxLength = 150
    
    // Try to find excerpt containing search words
    for (const word of searchWords) {
      const index = content.toLowerCase().indexOf(word.toLowerCase())
      if (index !== -1) {
        const start = Math.max(0, index - 50)
        const end = Math.min(content.length, start + maxLength)
        let excerpt = content.substring(start, end)
        
        if (start > 0) excerpt = '...' + excerpt
        if (end < content.length) excerpt = excerpt + '...'
        
        return excerpt
      }
    }
    
    // Fallback to beginning of content
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  getSuggestions(query: string): string[] {
    if (!query || query.length < 2) return []

    const lowercaseQuery = query.toLowerCase()
    const suggestions = new Set<string>()

    this.index.forEach(item => {
      // Check title
      if (item.title.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(item.title)
      }
      
      // Check keywords
      item.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(lowercaseQuery)) {
          suggestions.add(keyword)
        }
      })
      
      // Check category
      if (item.category.toLowerCase().includes(lowercaseQuery)) {
        suggestions.add(item.category)
      }
    })

    return Array.from(suggestions).slice(0, 5)
  }

  getPopularSearches(): string[] {
    return [
      'đăng nhập',
      'quên mật khẩu', 
      'xuất báo cáo',
      'thêm vị trí',
      'xem lịch sử',
      'dashboard',
      'không thấy dữ liệu'
    ]
  }

  addToIndex(item: SearchIndex) {
    this.index.push(item)
  }

  removeFromIndex(id: string) {
    this.index = this.index.filter(item => item.id !== id)
  }

  updateIndex(id: string, updates: Partial<SearchIndex>) {
    const index = this.index.findIndex(item => item.id === id)
    if (index !== -1) {
      this.index[index] = { ...this.index[index], ...updates }
    }
  }
}

// Export singleton instance
export const docSearch = new DocumentSearch()

// Export search function for convenience
export function searchDocs(query: string): SearchResult[] {
  return docSearch.search(query)
}

export function getSearchSuggestions(query: string): string[] {
  return docSearch.getSuggestions(query)
}

export function getPopularSearches(): string[] {
  return docSearch.getPopularSearches()
}
