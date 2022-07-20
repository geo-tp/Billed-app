/**
 * @jest-environment jsdom
 */
import BillsUI from "../views/BillsUI.js";
import {fireEvent, screen, waitFor} from "@testing-library/dom";
import { bills } from "../fixtures/bills.js"
import { ROUTES,ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import "@testing-library/jest-dom";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import $ from 'jquery';

jest.mock("./../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {

  describe('When I am on Bill Page and there are no bills', () => {
    test('Then, no bills should be shown', () => {
      document.body.innerHTML = BillsUI({data: []})
      const eyeIcon = screen.queryByTestId('icon-eye')
      expect(eyeIcon).toBeNull()
    })
  })

  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains("active-icon")).toBe(true)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on the new bill", () => {
      test("New bill form should display", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: bills })
  
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const billItems = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
  
        const newBillButton = screen.getByTestId('btn-new-bill');
  
        const handleClickNewBill = jest.fn(() =>
          billItems.handleClickNewBill
        );
        newBillButton.addEventListener('click',  handleClickNewBill);
        fireEvent.click(newBillButton);
        expect(handleClickNewBill).toHaveBeenCalled()
  
        const formNewBill = screen.getByTestId('form-new-bill')
        expect(formNewBill).toBeTruthy()
      })
    })

    describe("When I click on the icon eye", () => {
      test("Bill proof modal should open", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: bills })
  
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const billItems = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
  
        const eyeIcon = screen.getAllByTestId('icon-eye')[0];
  
        $.fn.modal = jest.fn();
        const handleClickIconEye = jest.fn(() =>
          billItems.handleClickIconEye(eyeIcon)
        );
        eyeIcon.addEventListener('click', handleClickIconEye);
        fireEvent.click(eyeIcon);
        expect(handleClickIconEye).toHaveBeenCalled()
  
        const modale = screen.getByTestId('modaleFileEmployee')
        expect(modale).toBeTruthy()
      })
    })
  }
 )
})


// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const tbody = screen.getByTestId("tbody")

      expect(tbody.childElementCount).toBe(4)
    })
  })

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
      }})
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ error: "Erreur 404"});
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
      }})
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})