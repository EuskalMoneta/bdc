import logging
import time

import pytest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait

log = logging.getLogger()

SELENIUM_URL = 'http://eusko_selenium:4444/wd/hub'
BASE_URL = 'http://bdc:8000'


class SeleniumTestException(Exception):
    def __init__(self, message):
        super(Exception, self).__init__(message)


@pytest.fixture(scope='session')
def driver(request):
    driver = webdriver.Remote(desired_capabilities=DesiredCapabilities.FIREFOX,
                              command_executor=SELENIUM_URL)
    driver.wait = WebDriverWait(driver, 20)
    driver.long_wait = WebDriverWait(driver, 60)
    yield driver
    print('teardown driver')
    driver.close()


class TestSuite:

    def test_001_login(self, driver):
        driver.get('{}/login'.format(BASE_URL))

        driver.find_element_by_id('username').send_keys('B001')
        driver.find_element_by_id('password').send_keys('B001')
        driver.find_element_by_class_name('btn-success').click()

    def test_002_entree_stock_bdc(self, driver):
        # wait until searchValue field is present (the page have successfully changed if its the case)
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.NAME, 'searchValue')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=searchValue" '
                                        '(search field in member search page)!')

        # assert that the page changed to /members/search
        assert driver.current_url == '{}/members/search'.format(BASE_URL)

        # switch to manager page
        driver.find_element_by_link_text('Gestion').click()

        try:
            # assert link data-eusko="entree-stock" is present and click it
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//a[@data-eusko="entree-stock"]')))
            driver.find_element_by_xpath('//a[@data-eusko="entree-stock"]').click()
        except:
            driver.close()
            raise SeleniumTestException('Could not locate link data-eusko="entree-stock" '
                                        '(in manager page)!')

        try:
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'react-bs-select-all')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member add page)!')

        # assert that the page changed to /members/entree-stock
        assert driver.current_url == '{}/manager/entree-stock'.format(BASE_URL)

        # select every line in the table
        driver.find_element_by_class_name('react-bs-select-all').click()

        # validate form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for member add page)!')

        # assert div with class="toast-succes" is present : member creation is OK!
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member add page)!')

    def test_003_member_search(self, driver):
        # go to homepage / member search page
        driver.get('{}/members/search'.format(BASE_URL))

        # wait until searchValue field is present (the page have successfully changed if its the case)
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.NAME, 'searchValue')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=searchValue" '
                                        '(search field in member search page)!')

        # assert that the page changed to /members/search
        assert driver.current_url == '{}/members/search'.format(BASE_URL)

        driver.find_element_by_name('searchValue').send_keys('lord')

        try:
            # wait until table is present
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'table')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=table" (table in member search page)!')

        assert len(driver.find_elements_by_xpath('//table/tbody/tr')) == 2

    def test_004_member_add(self, driver):
        try:
            # assert that the page is /members/search
            assert driver.current_url == '{}/members/search'.format(BASE_URL)
        except:
            driver.get('{}/members/search'.format(BASE_URL))

        driver.find_element_by_class_name('btn-success').click()

        # wait until login field is present
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.NAME, 'login')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=login" (login field in member add page)!')

        # assert that the page changed to /members/add
        assert driver.current_url == '{}/members/add'.format(BASE_URL)

        # fill in every field in this form
        driver.find_element_by_name('login').send_keys('E12345')
        driver.find_element_by_xpath('//input[@value="MR"]').click()

        driver.find_element_by_name('lastname').send_keys('Lastname')
        driver.find_element_by_name('firstname').send_keys('Firstname')
        driver.find_element_by_name('birth').send_keys('01/01/1980')
        driver.find_element_by_name('address').send_keys('Full member Address')

        # postal code + town
        # data-eusko="memberaddform-zip" > input
        input_zip = driver.find_element_by_xpath('//div[@data-eusko="memberaddform-zip"]//input')
        input_zip.send_keys('64600')
        time.sleep(5)  # sorry about that...
        input_zip.send_keys(Keys.DOWN, Keys.RETURN)

        driver.find_element_by_name('phone').send_keys('0559520654')
        driver.find_element_by_name('email').send_keys('email@valid.net')
        driver.find_element_by_xpath('//input[@value="0"]').click()  # newsletter? No!

        # choix association #1
        input_asso = driver.find_element_by_xpath('//div[@data-eusko="memberaddform-asso"]//input')
        input_asso.click()
        input_asso.send_keys(Keys.RETURN)

        # choix association #2
        input_asso2 = driver.find_element_by_xpath('//div[@data-eusko="memberaddform-asso2"]//input')
        input_asso2.click()
        input_asso2.send_keys(Keys.RETURN)

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # validate modal
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//button[@data-eusko="validate-modal"]')))
            driver.find_element_by_xpath('//button[@data-eusko="validate-modal"]').click()
        except:
            driver.close()
            raise SeleniumTestException('Could not locate button to validate the modal!')

        # toast div is in id="toast-container"
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for member add page)!')

        # assert div with class="toast-succes" is present : member creation is OK!
        try:
            driver.long_wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member add page)!')

    def test_005_member_subscription_add(self, driver):
        # wait until memberaddsubscription-amount field is present
        try:
            driver.wait.until(ec.presence_of_element_located(
                (By.XPATH, '//div[@data-eusko="memberaddsubscription-amount"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "data-eusko=memberaddsubscription-amount" '
                                        '(amount field in member subscription add page)!')

        # assert that the page changed to /members/subscription/add/<member_id>
        assert '/members/subscription/add/' in driver.current_url

        # subscription amount
        amount = driver.find_element_by_xpath('//div[@data-eusko="memberaddsubscription-amount"]//button')
        amount.click()

        # payment mode
        payment_mode = driver.find_element_by_xpath('//div[@data-eusko="memberaddsubscription-payment_mode"]//input')
        payment_mode.click()
        payment_mode.send_keys(Keys.RETURN)

        # quick fix to trigger button activation
        amount.click()

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for member add page)!')

        # assert div with class="toast-succes" is present : member subscription add is OK!
        try:
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member add page)!')

    def test_006_member_show(self, driver):
        # driver.get('{}/members/2554'.format(BASE_URL))
        try:
            # assert element data-eusko="member-show-login" is present
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//span[@data-eusko="member-show-login"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element data-eusko="member-show-login" '
                                        '(in member show page)!')

        assert driver.find_element_by_xpath('//span[@data-eusko="member-show-login"]').text == 'E12345'

        driver.find_element_by_link_text('Change').click()

    def test_007_member_change_euro_eusko(self, driver):
        try:
            # assert element data-eusko="memberchangeeuroeusko-amount" is present
            driver.wait.until(ec.presence_of_element_located(
                (By.XPATH, '//input[@data-eusko="memberchangeeuroeusko-amount"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element data-eusko="memberchangeeuroeusko-amount" '
                                        '(in member change page)!')

        # change_euro_eusko amount
        driver.find_element_by_xpath('//input[@data-eusko="memberchangeeuroeusko-amount"]').send_keys('10')

        # change_euro_eusko payment mode
        payment_mode = driver.find_element_by_xpath('//div[@data-eusko="memberchangeeuroeusko-payment_mode"]//input')
        payment_mode.click()
        payment_mode.send_keys(Keys.RETURN)

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for member change page)!')

        # assert div with class="toast-succes" is present : member change_euro_eusko is OK!
        try:
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member change page)!')

    def test_008_sortie_stock_bdc(self, driver):
        # go to manager page
        driver.get('{}/manager'.format(BASE_URL))

        try:
            # assert link data-eusko="sortie-stock" is present and click it
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//a[@data-eusko="sortie-stock"]')))
            driver.find_element_by_xpath('//a[@data-eusko="sortie-stock"]').click()
        except:
            driver.close()
            raise SeleniumTestException('Could not locate link data-eusko="sortie-stock" '
                                        '(in manager page)!')

        try:
            # assert element data-eusko="sortiestock-amount" is present
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//input[@data-eusko="sortiestock-amount"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element data-eusko="sortiestock-amount" '
                                        '(in sortie stock page)!')

        # sortiestock amount
        driver.find_element_by_xpath('//input[@data-eusko="sortiestock-amount"]').send_keys('20')

        # sortiestock porteur
        porteur = driver.find_element_by_xpath('//div[@data-eusko="sortiestock-porteur"]//input')
        porteur.click()
        porteur.send_keys(Keys.RETURN)

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for sortie stock page)!')

        # assert div with class="toast-succes" is present : member change_euro_eusko is OK!
        try:
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for sortie stock page)!')

        # assert title Historique stock billets is present
        try:
            driver.wait.until(ec.presence_of_element_located((By.XPATH, '//a[text()="Historique stock billets"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for sortie stock page)!')

        # assert that the page changed to /manager/history/stock-billets
        assert '/manager/history/stock-billets' in driver.current_url

        # assert line in table match our new Sortie Stock
        try:
            driver.wait.until(ec.presence_of_element_located(
                (By.XPATH, '//td[text()="Sortie stock - B001 - Euskal Moneta"]')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for sortie stock page)!')

    def test_999_member_change_password(self, driver):
        driver.find_element_by_class_name('dropdown-toggle').click()
        driver.find_element_by_link_text('Changer mon mot de passe').click()

        try:
            driver.wait.until(ec.presence_of_element_located((By.NAME, 'old_password')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=old_password" '
                                        '(old_password field in change password page)!')

        driver.find_element_by_name('old_password').send_keys('B001')
        driver.find_element_by_name('new_password').send_keys('b001')
        driver.find_element_by_name('confirm_password').send_keys('b001')

        # submit form
        driver.find_element_by_class_name('btn-success').click()

        # toast div is in id="toast-container"
        try:
            driver.wait.until(ec.presence_of_element_located((By.ID, 'toast-container')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "id=toast-container" '
                                        '(toast parent div for member change password page)!')

        # assert div with class="toast-succes" is present : member change_password is OK!
        try:
            driver.wait.until(ec.presence_of_element_located((By.CLASS_NAME, 'toast-success')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "class=toast-success" '
                                        '(toast success confirm for member change password page)!')

        # wait until username field is present (the page have successfully changed if its the case)
        try:
            driver.wait.until(ec.presence_of_element_located((By.NAME, 'username')))
        except:
            driver.close()
            raise SeleniumTestException('Could not locate element "name=username" (username field in member login)!')

        assert '/login' in driver.current_url
