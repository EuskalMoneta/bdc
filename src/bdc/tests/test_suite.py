import logging
# from urllib.parse import urljoin

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import Select, WebDriverWait

log = logging.getLogger()

SELENIUM_URL = 'http://eusko_selenium:4444/wd/hub'
BASE_URL = 'http://bdc:8000'


@pytest.fixture(scope='session')
def driver(request):
    driver = webdriver.Remote(desired_capabilities=DesiredCapabilities.FIREFOX,
                              command_executor=SELENIUM_URL)
    driver.wait = WebDriverWait(driver, 20)
    driver.long_wait = WebDriverWait(driver, 60)
    return driver
    # driver.quit()


class TestSuite:

    def test_1_login(self, driver):
        driver.get('{}/login'.format(BASE_URL))

        driver.find_element_by_id('username').send_keys('B001')
        driver.find_element_by_id('password').send_keys('B001')
        driver.find_element_by_class_name('btn-success').click()

        # wait until searchValue field is present (the page have successfully changed if its the case)
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.NAME, 'searchValue')))
        except:
            assert False, "Could not locate element name=searchValue (search field in member search page)!"
            driver.quit()

        # assert that the page changed to /members/search
        assert driver.current_url == '{}/members/search'.format(BASE_URL)

    def test_2_member_add(self, driver):
        # assert that the page is /members/search
        assert driver.current_url == '{}/members/search'.format(BASE_URL)

        driver.find_element_by_class_name('btn-success').click()

        # wait until login field is present
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.NAME, 'login')))
        except:
            assert False, "Could not locate element name=searchValue (search field in member search page)!"
            driver.quit()

        # assert that the page changed to /members/add
        assert driver.current_url == '{}/members/add'.format(BASE_URL)

        # fill in every field in this form
        driver.find_element_by_name('login').send_keys('E12345')
        driver.find_element_by_xpath('//input[@value="MR"]').click()
        # select = Select()

        driver.find_element_by_name('lastname').send_keys('Lastname')
        driver.find_element_by_name('firstname').send_keys('Firstname')
        driver.find_element_by_name('birth').send_keys('01/01/1980')
        driver.find_element_by_name('address').send_keys('Full member Address')

        # postal code + town
        # data-eusko="memberaddform-zip" > input
        driver.find_element_by_xpath(
            '//div[@data-eusko="memberaddform-zip"]//input').send_keys('64600 ')
        driver.implicitly_wait(10)
        driver.find_element_by_xpath(
            '//div[@data-eusko="memberaddform-zip"]//input').send_keys(Keys.RETURN)
        # driver.find_element_by_xpath('//div[@data-eusko="memberaddform-town"]//input').send_keys('Angelu / Anglet')
        # driver.find_element_by_xpath('//div[@data-eusko="memberaddform-town"]//div[@class="memberaddform"]').click()

        driver.find_element_by_name('phone').send_keys('0559520654')
        driver.find_element_by_name('email').send_keys('email@valid.net')
        driver.find_element_by_xpath('//input[@value="0"]').click()  # newsletter? No!

        # submit form
        # driver.find_element_by_class_name('btn-success').click()
