import asyncio
import json
import random
import time
from playwright.async_api import async_playwright
import nest_asyncio

# 이미 실행 중인 이벤트 루프 수정 (Jupyter 환경)
nest_asyncio.apply()

# 세마포어 설정: 동시에 최대 20명의 사용자만 시뮬레이션
SEM_MAX = 40
MAX_USERS = 40  # 총 사용자 수
URL = "https://dydtkddl.github.io/WebResearch/2"  # 대상 URL
URL = "http://webresearch.pythonanywhere.com/"
semaphore = asyncio.Semaphore(SEM_MAX)

async def user_simulation(user_id):
    """사용자 시뮬레이션 함수"""
    async with semaphore:  # 세마포어로 동시 실행 수 제한
        await asyncio.sleep(random.uniform(2, 5))  # 임의의 지연 시간
        print(f"사용자 {user_id} 시뮬레이션 시작")

        async with async_playwright() as p:
            # 브라우저 실행: 캐시 비활성화, 새 인스턴스 시작
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                bypass_csp=True,  # 콘텐츠 보안정책 우회 (필요 시)
                no_viewport=True,  # 브라우저 최대화
                ignore_https_errors=True,  # HTTPS 오류 무시
                storage_state=None
            )
            page = await context.new_page()

            # 네트워크 요청 및 응답 추적
            network_log = []

            def log_request(request):
                """HTTP 요청 로그"""
                network_log.append({
                    "type": "request",
                    "url": request.url,
                    "method": request.method,
                    "headers": dict(request.headers),
                })

            async def log_response(response):
                """HTTP 응답 로그"""
                try:
                    body = await response.body()  # 응답 본문 가져오기
                    network_log.append({
                        "type": "response",
                        "url": response.url,
                        "status": response.status,
                        "headers": dict(response.headers),
                        "body": body.decode("utf-8", errors="ignore")
                    })
                except Exception as e:
                    print(f"사용자 {user_id}: 응답 로깅 중 오류 - {e}")

            page.on("request", log_request)
            page.on("response", log_response)

            try:
                # 웹사이트 접속
                await page.goto(URL)

                async def press_enter():
                    """엔터 키 입력"""
                    await page.keyboard.press("Enter")
                    print(f"사용자 {user_id}: 엔터 입력 완료")
                    await asyncio.sleep(random.uniform(0.5, 1.5))

                async def click_button(button_id):
                    """버튼 클릭"""
                    await page.click(f'#{button_id}')
                    print(f"사용자 {user_id}: 버튼 {button_id} 클릭 완료")
                    await asyncio.sleep(random.uniform(1, 2))

                async def select_radio_button(value):
                    """라디오 버튼 선택"""
                    await page.click(f'input[name="jspsych-survey-multi-choice-response-0"][value="{value}"]')
                    print(f"사용자 {user_id}: 라디오 버튼 {value} 선택 완료")
                    await asyncio.sleep(random.uniform(2, 5))

                # 동작 수행
                await press_enter()
                await click_button('jspsych-instructions-next')
                await click_button('jspsych-instructions-next')
                await click_button('jspsych-instructions-next')
                await press_enter()

                await select_radio_button('C')
                await click_button('jspsych-survey-multi-choice-next')
                await press_enter()

                await press_enter()
                await select_radio_button('F')
                await click_button('jspsych-survey-multi-choice-next')
                await press_enter()
                await press_enter()

                for _ in range(8):
                    await select_radio_button('F')
                    await click_button('jspsych-survey-multi-choice-next')

            finally:
                # 네트워크 로그 저장
                with open(f"user_{user_id}_network_log.json", "w") as f:
                    json.dump(network_log, f, indent=4)

                # 브라우저 종료
                await browser.close()
                print(f"사용자 {user_id} 시뮬레이션 완료")

async def main():
    """40명의 사용자 시뮬레이션을 비동기 방식으로 실행"""
    tasks = [user_simulation(user_id) for user_id in range(MAX_USERS)]
    await asyncio.gather(*tasks)

# 메인 함수 실행
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
