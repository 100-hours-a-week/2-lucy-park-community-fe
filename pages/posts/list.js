// pages/posts/list.js

export function render() {
    return `
      <section class="post-list-container">
        <h2>게시글 목록</h2>
        <ul>
          <li>글 제목 1</li>
          <li>글 제목 2</li>
          <li>글 제목 3</li>
        </ul>
      </section>
    `;
  }
  
  // 목록 페이지에 필요한 이벤트나 CSS가 있다면 setup() 추가
  export function setup() {
    // 예) 동적 스타일 로드, 이벤트 바인딩 등
    // loadStyles();
    // setupEventListeners();
  }
  