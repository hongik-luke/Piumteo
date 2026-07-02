# 지도 흐름 / 와이어프레임 기준

## 기본 화면

- 첫 화면은 지도다.
- 지도에는 장소 타입에 따라 다른 색/디자인의 마커를 표시한다.
- 마커 응답은 `placeId`, `placeName`, `placeType`, `latitude`, `longitude`만 사용한다.
- 마커 디자인은 프론트엔드가 `placeType`을 기준으로 결정한다.

## 프론트 호출 흐름

### 앱 첫 진입

1. 브라우저/앱에서 현재 위치 권한을 요청한다.
2. 현재 위치를 얻으면 `GET /api/places/nearby?lat={lat}&lng={lng}`를 호출한다.
3. 서버는 현재 위치 기준 1km 안의 장소 마커를 최대 100개, 거리순으로 응답한다.
4. 프론트는 응답된 장소들을 지도 마커로 표시한다.

### 내 위치 버튼

1. 현재 위치를 다시 가져온다.
2. 지도 중심을 현재 위치로 이동한다.
3. `GET /api/places/nearby`를 다시 호출한다.

### 지도 이동 / 줌 변경

1. 지도 idle 이벤트에서 현재 화면 bounds를 얻는다.
2. `GET /api/places/bounds?minLat={minLat}&minLng={minLng}&maxLat={maxLat}&maxLng={maxLng}`를 호출한다.
3. 서버는 화면 안의 장소 마커를 최대 100개, 최신 등록순으로 응답한다.
4. 프론트는 기존 마커를 갱신한다.

### 마커 클릭

1. 사용자가 마커를 클릭한다.
2. `GET /api/places/{placeId}/summary`를 호출한다.
3. 바텀시트에 장소 상세 요약을 표시한다.
4. summary 호출이 성공하면 서버는 `viewCount`를 1 증가시킨다.

## 장소 등록 흐름

1. 사용자가 장소 등록 모드로 진입한다.
2. 지도 중앙에 고정 핀을 표시한다.
3. 사용자가 지도를 움직여 중앙 핀 위치를 조정한다.
4. 등록 시점의 지도 중앙 좌표를 장소 좌표로 사용한다.
5. `POST /api/places`를 호출한다.

## 바텀시트 표시 정보

- 장소 이름
- 장소 타입
- 현재 위치와의 거리 표시는 프론트 계산 또는 후순위로 둔다.
- 위치 설명
- 좋아요 수
- 싫어요 수
- 댓글 수
- 조회수
- 현재 시간대 내 사용자의 반응 상태
- 현재 사용자가 등록자인지 여부

## 관련 이미지

- [sitemap.png](assets/sitemap.png)
- [wireframe.png](assets/wireframe.png)
- [overall_flow.png](assets/overall_flow.png)
- [reaction_flow.png](assets/reaction_flow.png)
