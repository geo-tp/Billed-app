/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES,ROUTES_PATH } from "../constants/routes.js";
import userEvent from "@testing-library/user-event"

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList.contains("active-icon")).toBe(true)
    })

    describe("When I click on submit button", () => {
      test("Then the form is saved", () => {
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({
          type: "Employee"
        }))

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        document.body.innerHTML = NewBillUI()

        const newBillItem = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const formNewBill = screen.getByTestId("form-new-bill")

        const handleSubmit = jest.fn((e) => newBillItem.handleSubmit(e));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);

        expect(handleSubmit).toHaveBeenCalled();

      })
    })

    describe("When I upload a file", () => {
      test("Then file is added to input files", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }   

        document.body.innerHTML = NewBillUI()

        const newBillItem = new NewBill({
          document, onNavigate, store: null, localStorage: window.localStorage
        })

        const image = new File(['image'], 'image.jpg', {type: 'image/jpg'})
        const handleChangeFile = jest.fn(newBillItem.handleChangeFile)
        const inputFile = screen.getByTestId("file")

        inputFile.addEventListener("change", handleChangeFile);     
        userEvent.upload(inputFile, image)
        expect(inputFile.files[0].name).toBe("image.jpg")
      })
    })
  })
})
