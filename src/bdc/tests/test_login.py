import logging
# from urllib.parse import urljoin

import pytest

from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait

log = logging.getLogger()

SELENIUM_URL = 'http://eusko_selenium:4444/wd/hub'
BASE_URL = 'http://bdc:8000'


@pytest.fixture(scope='session')
def browser(request):
    driver = webdriver.Remote(desired_capabilities=DesiredCapabilities.FIREFOX,
                              command_executor=SELENIUM_URL)
    driver.wait = WebDriverWait(driver, 20)
    return driver


class TestLogin:

    def test_1_login(self, browser):
        browser.get('{}/login'.format(BASE_URL))
        username = browser.find_element_by_id('username')
        password = browser.find_element_by_id('password')
        button = browser.find_element_by_class_name('btn-success')

        username.send_keys('B001')
        password.send_keys('B001')
        browser.wait.until(ec.element_to_be_clickable(button))

        button.click()
