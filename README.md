# Code Typing Defense

프로그래밍 키워드를 입력해 적을 제거하는 개발자 학습형 타자 디펜스 게임입니다.  
C/C++, Java, Python 언어별 키워드와 난이도별 단어 구성을 제공하며, 플레이어는 화면에 등장하는 적의 단어를 정확히 입력해 방어선을 지켜야 합니다.

---

## 프로젝트 개요

`Code Typing Defense`는 단순한 타자 게임이 아니라, 프로그래밍 언어 키워드와 주요 개념어를 자연스럽게 익힐 수 있도록 설계한 미니게임입니다.
플레이어는 게임 시작 전 사용할 프로그래밍 언어와 난이도를 선택합니다.  
게임이 시작되면 선택한 조건에 맞는 키워드를 가진 적들이 화면에 등장하고, 플레이어는 해당 단어를 입력해 적을 제거합니다.  
적이 방어선에 도달하면 HP가 감소하며, HP가 모두 소진되면 게임이 종료됩니다.

---

## 제작 목적

이 프로젝트의 목적은 짧은 개발 기간 안에 완성 가능한 웹 기반 미니게임을 제작하면서, 다음과 같은 요소를 직접 구현해보는 것입니다.

- 실시간 게임 루프 구현
- 키보드 입력 처리
- 랜덤 적 생성
- 충돌 및 도달 판정
- 점수 및 HP 시스템
- 난이도 조절
- 언어별 데이터 관리
- 최고 점수 저장
- 반응형 UI 구성

---

## 주요 기능

### 1. 언어 선택

게임 시작 전 플레이할 언어 모드를 선택할 수 있습니다.
지원 예정 언어는 다음과 같습니다.

- C / C++
- Java
- Python
- Mixed Mode
  각 언어 모드에서는 해당 언어와 관련된 키워드, 문법 요소, 라이브러리명, 개념어 등이 등장합니다.

---

### 2. 난이도 선택

각 언어는 세 가지 난이도로 구분됩니다.

- Easy
- Normal
- Hard
  난이도에 따라 등장하는 단어의 길이, 적의 속도, 생성 빈도 등이 달라집니다.

---

### 3. 실시간 타자 디펜스

적들이 화면 오른쪽에서 왼쪽으로 이동합니다.  
각 적 위에는 프로그래밍 키워드가 표시됩니다.
플레이어가 입력창에 단어를 입력하고 Enter 키를 누르면, 일치하는 단어를 가진 적이 제거됩니다.

---

### 4. HP 및 점수 시스템

적을 제거하면 점수가 증가합니다.  
적이 방어선에 도달하면 플레이어의 HP가 감소합니다.  
HP가 0이 되면 게임 오버 화면이 표시됩니다.

---

### 5. 최고 점수 저장

브라우저의 Local Storage를 활용하여 최고 점수를 저장합니다.  
게임을 다시 실행해도 이전 최고 점수를 확인할 수 있습니다.

---

### 6. Mixed Mode

Mixed Mode에서는 C/C++, Java, Python 키워드가 랜덤으로 등장합니다.  
여러 언어의 키워드가 섞여 나오기 때문에 가장 높은 난이도의 모드로 구성할 수 있습니다.

---

## 게임 규칙

1. 게임 시작 전 언어와 난이도를 선택합니다.
2. 적들이 화면에 등장하며 왼쪽 방어선을 향해 이동합니다.
3. 적 위에 표시된 단어를 입력창에 입력합니다.
4. Enter 키를 누르면 입력한 단어와 일치하는 적이 제거됩니다.
5. 적을 제거하면 점수를 얻습니다.
6. 적이 방어선에 도달하면 HP가 감소합니다.
7. HP가 모두 소진되면 게임이 종료됩니다.
8. 게임 종료 후 최종 점수와 최고 점수를 확인할 수 있습니다.

---

## 언어별 키워드 구성

### C / C++

#### Easy

```txt
int
char
float
if
else
for
while
return
void
main

Normal

printf
scanf
include
define
struct
sizeof
malloc
free
nullptr
vector

Hard

template
namespace
constexpr
unordered_map
dynamic_cast
shared_ptr
unique_ptr
priority_queue

⸻

Java

Easy

class
public
static
void
main
String
int
if
else
return

Normal

private
protected
extends
implements
interface
ArrayList
HashMap
Scanner
System
println

Hard

synchronized
IOException
NullPointerException
BufferedReader
StringBuilder
Collections
Comparable
Serializable

⸻

Python

Easy

def
if
else
elif
for
while
return
print
input
list

Normal

lambda
import
except
finally
class
range
append
dictionary
comprehension

Hard

decorator
generator
asyncio
enumerate
itertools
collections
dataclass
contextmanager

⸻

언어별 게임 특성

각 언어 모드는 단어만 다르게 구성하는 것이 아니라, 언어의 이미지에 맞는 게임 특성을 부여할 수 있습니다.

C / C++ Mode

C/C++은 고성능, 저수준 제어의 이미지가 강하기 때문에 적의 이동 속도를 빠르게 설정합니다.

Enemy Speed +10%

⸻

Java Mode

Java는 긴 키워드와 객체지향적인 구조가 많기 때문에 적의 체력 또는 단어 길이를 높게 설정합니다.

Longer Words
Tanky Enemies

⸻

Python Mode

Python은 상대적으로 짧고 간결한 문법이 많기 때문에 단어는 짧지만 적의 등장 빈도를 높게 설정합니다.

More Enemies
Shorter Words

⸻

Mixed Mode

Mixed Mode는 모든 언어의 단어가 랜덤으로 등장하는 고난도 모드입니다.

Random Language Keywords
Highest Difficulty

⸻

기술 스택

예상 기술 스택은 다음과 같습니다.

React
TypeScript
Vite
CSS
Local Storage

또는 더 단순한 버전으로는 다음과 같이 구현할 수 있습니다.

HTML
CSS
JavaScript

⸻

데이터 구조 예시

언어와 난이도별 키워드는 다음과 같은 객체 구조로 관리할 수 있습니다.

const WORD_BANK = {
  cpp: {
    easy: ["int", "char", "float", "if", "else", "for", "while", "return"],
    normal: ["printf", "scanf", "include", "struct", "sizeof", "malloc", "vector"],
    hard: ["template", "namespace", "constexpr", "unordered_map", "priority_queue"]
  },
  java: {
    easy: ["class", "public", "static", "void", "main", "String", "return"],
    normal: ["private", "extends", "implements", "interface", "ArrayList", "HashMap"],
    hard: ["synchronized", "NullPointerException", "BufferedReader", "StringBuilder"]
  },
  python: {
    easy: ["def", "if", "else", "elif", "for", "while", "return", "print"],
    normal: ["lambda", "import", "except", "finally", "append", "dictionary"],
    hard: ["decorator", "generator", "asyncio", "enumerate", "contextmanager"]
  }
};

이 구조를 사용하면 게임 로직과 콘텐츠 데이터를 분리할 수 있어 유지보수가 쉬워집니다.

⸻

구현 예정 기능

필수 기능

* 시작 화면
* 언어 선택
* 난이도 선택
* 게임 화면
* 적 랜덤 생성
* 적 이동
* 단어 입력
* 입력 단어와 적 단어 매칭
* 적 제거
* 점수 증가
* HP 감소
* 게임 오버 화면
* 최고 점수 저장

⸻

추가 기능

개발 시간이 남을 경우 다음 기능을 추가할 수 있습니다.

* 콤보 시스템
* WPM 계산
* 타자 정확도 계산
* 언어별 배경 색상
* 언어별 아이콘
* Mixed Mode
* 사운드 효과
* 피격 이펙트
* 적 제거 애니메이션
* 랭크 시스템

⸻

화면 구성

시작 화면

* 게임 제목
* 언어 선택 버튼
* 난이도 선택 버튼
* 게임 시작 버튼
* 최고 점수 표시

⸻

게임 화면

* 현재 점수
* 최고 점수
* HP
* 남은 시간 또는 진행 시간
* 입력창
* 이동 중인 적
* 방어선

⸻

게임 오버 화면

* 최종 점수
* 최고 점수
* 플레이한 언어
* 선택한 난이도
* 다시 시작 버튼
* 메인 화면으로 이동 버튼

⸻

점수 시스템 예시

Easy enemy: +10 points
Normal enemy: +20 points
Hard enemy: +30 points
Combo bonus: +5 points per combo

난이도와 단어 길이에 따라 점수를 다르게 부여할 수 있습니다.

⸻

난이도 조절 방식

난이도는 다음 요소를 조합하여 조절합니다.

* 적 이동 속도
* 적 생성 간격
* 단어 길이
* 동시에 등장하는 적의 수
* HP 감소량
* 콤보 유지 시간

예시:

Easy:
- 느린 적 이동 속도
- 짧은 단어
- 낮은 생성 빈도
Normal:
- 보통 이동 속도
- 중간 길이 단어
- 보통 생성 빈도
Hard:
- 빠른 이동 속도
- 긴 단어
- 높은 생성 빈도

⸻

개발 일정

Day 1

* 프로젝트 생성
* 기본 화면 구성
* 언어 선택 기능 구현
* 난이도 선택 기능 구현
* 단어 데이터 구성
* 적 생성 로직 구현
* 적 이동 로직 구현
* 입력 처리 구현
* 단어 매칭 및 적 제거 구현
* 점수 및 HP 시스템 구현

⸻

Day 2

* 게임 오버 화면 구현
* 최고 점수 저장 기능 구현
* UI 디자인 개선
* 언어별 색상 적용
* 애니메이션 추가
* README 작성
* 배포 준비
* 테스트 및 버그 수정

⸻

포트폴리오 어필 포인트

이 프로젝트는 단순한 타자 게임이 아니라, 프로그래밍 언어 학습 요소를 결합한 미니게임입니다.

특히 다음과 같은 점을 강조할 수 있습니다.

* 게임 루프와 상태 관리를 직접 구현
* 언어와 난이도별 키워드 데이터를 구조화
* 사용자 입력 기반 실시간 상호작용 구현
* 점수, HP, 콤보, 최고 점수 저장 등 게임 시스템 구성
* Local Storage를 활용한 데이터 저장
* 짧은 개발 기간 내 완성 가능한 기능 중심 설계
* 학습성과 재미를 결합한 개발자 대상 미니게임

⸻

프로젝트 설명 문장

포트폴리오에 사용할 수 있는 설명 문장은 다음과 같습니다.

Code Typing Defense는 C/C++, Java, Python 키워드를 기반으로 한 개발자 학습형 타자 디펜스 게임입니다. 플레이어는 화면에 등장하는 적의 키워드를 입력해 적을 제거하며, 언어와 난이도에 따라 다른 단어와 게임 흐름을 경험할 수 있습니다. 언어별 키워드 데이터를 객체 구조로 분리하여 유지보수성을 높였고, 점수, HP, 최고 점수 저장, 난이도 조절 등 기본적인 게임 시스템을 직접 구현했습니다.

⸻

향후 개선 방향

* 사용자 계정 기반 랭킹 시스템 추가
* Firebase 연동을 통한 온라인 최고 점수 저장
* 언어별 학습 설명 추가
* 오답 단어 복습 기능 추가
* 모바일 화면 최적화
* 다국어 지원
* 더 많은 언어 추가
    * JavaScript
    * TypeScript
    * SQL
    * Kotlin
    * Go
    * Rust
```
