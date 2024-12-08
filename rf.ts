interface ReMsg {
    re: RegExp
    message: string
}

class ReactiveForm {
    private formElement: HTMLFormElement;
    private allSections: NodeListOf<HTMLDivElement>;
    private passwordInput: HTMLInputElement;

    constructor(form: HTMLFormElement) {
        this.formElement = form;
        this.allSections = form.querySelectorAll(".form-sec");
        this.allSections.forEach((x: HTMLDivElement) => {
            let rfMessage: HTMLDivElement = x.querySelector("[rf-message]") as HTMLDivElement;
            if (rfMessage) rfMessage.style.display = 'none';
        })
        this.passwordInput = this.formElement.querySelector("input[type=password]") as HTMLInputElement;

        for (let i = 0; i < this.allSections.length; i++) {
            let section = this.allSections[i];
            let inputElement: HTMLInputElement = section.querySelector('input') as HTMLInputElement;
            section.addEventListener('input', (_event) => this.validateField(i));
            this.validateField(i);
        }
    }

    private hideMessage(id: number) {
        let sr = this.allSections[id].querySelector('[rf-message]') as HTMLDivElement;
        if (sr) sr.style.display = 'none';
    }

    private validateField(id: number) {
        let type: string | null;
        let input: HTMLInputElement = this.allSections[id].querySelector('input') as HTMLInputElement;

        if (input.value != "") {
            if (input.getAttribute('rf-validate') !== "")
                type = input.getAttribute('rf-validate')
            else return -1

            if (type == 'email') this.validateEmail(id)
            else if (type == 'username') this.validateUsername(id)
            else if (type == 'phone') this.validatePhone(id)
            else if (type == 'password') this.validatePassword(id)
            else if (type == 'confirm-password') this.validateConfirmPassword(id)
        } else this.hideMessage(id);
    }

    private validateConfirmPassword(id: number) {
        let pwd = this.passwordInput.value;
        let confirmPwd = this.allSections[id].querySelector('input[validate=confirm-password]') as HTMLInputElement;

        if (pwd === confirmPwd.value) this.hideMessage(id);
        else this.wrongValue(id, "Passwords do not match");

    }

    private validatePhone(id: number) {
        const phoneRegex = /^\d{10}$/
        let input = this.allSections[id].children[1] as HTMLInputElement;

        this.validateRegEx(id, phoneRegex, "Invalid Phone No.");
    }

    private validatePassword(id: number) {

        const passwordRules: ReMsg[] = [
            {
                re: /^.{8,}$/,
                message: "Length must be at least <strong>8</strong> characters"
            },
            {
                re: /[A-Z]{1,}/,
                message: "Should contain at least <strong>1</strong> Uppercase character"
            },
            {
                re: /[a-z]{1,}/,
                message: "Should contain at least <strong>1</strong> Lowercase character"
            },
            {
                re: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{1,}/,
                message: "Should have at least <strong>1</strong> symbol"
            }
        ];

        let input = this.allSections[id].children[1] as HTMLInputElement;
        let pwd = input.value;

        this.validateMultipleRules(id, passwordRules);
    }

    private validateEmail(id: number) {
        const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm
        this.validateRegEx(id, emailRegex, "Invalid Email")
    }

    private validateUsername(id: number) {
        let validCharacters = {
            re: /^\w*$/,
            message: "use only Alphabets, Digits & Underscore(_)"
        } as ReMsg;
        let length = { re: /^.{6,}$/, message: "username must be at least <strong>6</strong> characters long" }

        this.validateMultipleRules(id, [validCharacters, length]);
    }

    private validateRegEx(id: number, regex: RegExp, message: string) {
        let input: HTMLInputElement = this.allSections[id].querySelector('input') as HTMLInputElement;
        if (!regex.test(input.value))
            this.wrongValue(id, message);
        else this.hideMessage(id);
    }

    private validateMultipleRules(id: number, rules: ReMsg[]) {
        const value = (this.allSections[id].querySelector('input') as HTMLInputElement).value
        let failedRules = rules.filter(rule => !rule.re.test(value));

        if (failedRules.length > 0) {
            let errorMessages = failedRules.map(rule => rule.message).join('<br>');
            this.wrongValue(id, errorMessages);
        } else {
            this.hideMessage(id);
        }
    }

    private wrongValue(id: number, msg: string) {
        let x: HTMLDivElement = this.allSections[id].querySelector('[rf-message]') as HTMLDivElement;
        x.style.display = '';
        x.innerHTML = msg;
    }

    get(name: string, label: boolean = false) {
        return label ? this.getByLabel(name) : this.getByName(name); 
    }

    getAll() {
        // return an object with the keys of input's name and value as the input's value
        return Array.from(
            this.formElement.querySelectorAll('input'))
            .reduce(
                (obj: { [x: string]: string }, input) => {
                    obj[input.name] = input.value;
                    return obj;
                }, {});
    }

    private getByName(name: string): string | null {
        let input = this.formElement.querySelector('input[name="' + name + '"]') as HTMLInputElement;
        return input ? input.value : null;
    }

    private getByLabel(label: string) {
        this.allSections.forEach((section: HTMLDivElement) => {
            let localLabel: string = section.querySelector('label')!.textContent!;
            if (localLabel === label) return section.querySelector('input')!.value ?? "";
        })

    }

}

export default ReactiveForm;
