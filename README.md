# 2-Lucy-Park-Community-FE

## 📌 프로젝트 개요
- **주제:** 로컬 스토리지를 활용한 와글와글 커뮤니티 웹 애플리케이션 (React 리팩토링 예정)

⠀  

## 🏗️ 프로젝트 구조

### **📂 폴더 구조**
```bash
/project-root
│── /assets           # 정적 파일 (기본 프로필 이미지)
│── /styles           # 개별 페이지 CSS
│── /scripts          # app.js, util.js (공통 로직)
│── /components       # 재사용 가능한 UI 컴포넌트
│── /pages            # 주요 카테고리별 폴더
│   │── /auth         # 인증 관련 페이지
│   │   │── login.js        # 로그인 페이지
│   │   │── signup.js       # 회원 가입 페이지 
│   │── /posts        # 게시글 관련 페이지
│   │   │── posts.js        # 게시글 목록 페이지
│   │   │── post.js         # 게시글 상세 페이지
│   │   │── editPost.js     # 게시글 수정 페이지
│   │   │── makePost.js     # 게시글 추가 페이지
│   │── /user         # 회원 정보 관련 페이지
│   │   │── editProfile.js  # 회원 정보 수정 페이지
│   │   │── editPassword.js # 비밀번호 변경 페이지
│── index.html        # 메인 페이지
│── styles.css        # 전역 스타일
```
⠀  

### **🛠️ 주요 컴포넌트**
| 번호 | 컴포넌트 이름 | 파일명 | 설명 |
| --- | --- | --- | --- |
| 1 | 헤더 | `Header.js` | 페이지 상단 헤더 |
| 2 | 호버 버튼 | `HoverButton.js` | 마우스 호버 시 스타일 변경 버튼 |
| 3 | 유효성 버튼 | `ValidationButton.js` | 유효성 검사 결과에 따라 활성화되는 버튼 |
| 4 | 프로필 로고 버튼 | `ProfileLogoButton.js` | 프로필 아이콘 포함 버튼 |
| 5 | 확인 팝업 | `ConfirmPopup.js` | 확인/취소 버튼이 있는 모달 팝업 |
| 6 | 뒤로가기 버튼 | `BackButton.js` | 뒤로 가기 기능 버튼 |
| 7 | 푸터 | `Footer.js` | 페이지 하단 헤더 |

⠀  

## 🚀 기능 요약
| **폴더** | **파일명** | **설명** |
| --- | --- | --- |
| **`/pages/auth/`** | `login.js` | 이메일·비밀번호 입력 및 로그인 검증 |
|  | `signup.js` | 회원가입 (이메일·비밀번호·닉네임·프로필 사진 등록) |
| **`/pages/posts/`** | `posts.js` | 게시글 목록 (무한 스크롤, 좋아요·댓글·조회수 표시) |
|  | `post.js` | 게시글 상세 페이지 (댓글 작성, 좋아요, 조회수 증가) |
|  | `makePost.js` | 게시글 작성 (제목·내용·이미지 업로드) |
|  | `editPost.js` | 게시글 수정 (제목·내용·이미지 변경) |
| **`/pages/user/`** | `editProfile.js` | 닉네임·프로필 사진 수정 |
|  | `editPassword.js` | 비밀번호 변경 |
| **`/scripts/`** | `app.js` | 페이지 로딩 및 전역 이벤트 관리 |
|  | `utils.js` | 공통 함수 (데이터 포매팅, 게시글 찾기 등) |
| **`/data/`** | `posts.json` | 게시글 예시 데이터 |
|  | `comments.json` | 댓글 예시 데이터 |

⠀  

## 📌 회고
- 지속적인 업데이트가 필요하다...
  
