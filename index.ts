
class ReactiveForm {
    private formElement: HTMLFormElement;
    private allSections: NodeListOf<HTMLDivElement>;
    private passwordInput: HTMLInputElement | null;
    private attributes: { [x: string]: string } = {
        'validate': 'rf-validate',
        'message': 'rf-message'
    };
    private storageID!: string;
    private memory: boolean = false;

    valid(): boolean {
        return this.empty() ? false :
            Array.from(this.allSections).every((x: HTMLDivElement) => {
                let e: HTMLDivElement | null = x.querySelector(`[${this.attributes['message']}]`);
                return e ? e.style.display === 'none' : true;
            });
    }

    empty(): boolean {
        return Array.from(this.allSections).some((x: HTMLDivElement) => {
            let input: HTMLInputElement = x.querySelector('input') as HTMLInputElement;
            return input.value === "";
        });
    }


    private memoryExists(): boolean { return localStorage.getItem(this.storageID) ? true : false; }

    private hideMessage(id: number) {
        let sr = this.allSections[id].querySelector(`[${this.attributes['message']}]`) as HTMLDivElement;
        if (sr) sr.style.display = 'none';
    }

    private validateField(id: number) {
        let type: string | null;
        let input: HTMLInputElement = this.allSections[id].querySelector('input') as HTMLInputElement;

        if (input.value != "") {
            if (input.getAttribute(this.attributes['validate']) !== "")
                type = input.getAttribute(this.attributes['validate'])
            else return -1

            if (type == 'email') this.validateEmail(id)
            else if (type == 'username') this.validateUsername(id)
            else if (type == 'phone') this.validatePhone(id)
            else if (type == 'password') this.validatePassword(id)
            else if (type == 'confirm-password') this.validateConfirmPassword(id)
        } else this.hideMessage(id);
    }

    private validateConfirmPassword(id: number) {
        if (!this.passwordInput) {
            console.error("No Password input in the form");
            return;
        }
        let pwd = this.passwordInput.value;
        let confirmPwd = this.allSections[id].querySelector(`input[${this.attributes['validate']}=confirm-password]`) as HTMLInputElement;

        if (pwd === confirmPwd.value) this.hideMessage(id);
        else this.wrongValue(id, "Passwords do not match");

    }

    private validatePhone(id: number) {
        const phoneRegex = /^\d{10}$/
        this.validateRegEx(id, phoneRegex, "Invalid Phone No.");
    }

    private validatePassword(id: number) {

        const passwordRules: { re: RegExp, message: string }[] = [
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
        };
        let length = { re: /^.{6,}$/, message: "username must be at least <strong>6</strong> characters long" }

        this.validateMultipleRules(id, [validCharacters, length]);
    }

    private validateRegEx(id: number, regex: RegExp, message: string) {
        let input: HTMLInputElement = this.allSections[id].querySelector('input') as HTMLInputElement;
        if (!regex.test(input.value))
            this.wrongValue(id, message);
        else this.hideMessage(id);
    }

    private validateMultipleRules(id: number, rules: { re: RegExp, message: string }[]) {
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
        let x: HTMLDivElement = this.allSections[id].querySelector(`[${this.attributes['message']}]`) as HTMLDivElement;
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

    public saveToLocal() {
        let formData: {} = this.getAll();
        let identifier: string = this.storageID;
        localStorage.setItem(identifier, JSON.stringify(formData));
    }

    private getFromLocal() {
        if (!this.memoryExists()) return;
        let data = localStorage.getItem(this.storageID);
        return data ? JSON.parse(data) : {};
    }

    public fillFromLocal() {
        let json: { [x: string]: string } = this.getFromLocal();
        Object.keys(json).forEach((key) => this.fill(key, json[key]));
    }

    private fill(name: string, value: string) {
        this.allSections.forEach((section: HTMLDivElement) => {
            let input = section.querySelector(`input[name=${name}]`) as HTMLInputElement;
            if (input) input.value = value;
        })
    }

    public enableMemory() { this.memory = true; }

    public disableMemory() {
        localStorage.removeItem(this.storageID);
        this.memory = false; 
    }

    constructor(form: HTMLFormElement) {
        this.formElement = form;
        this.allSections = form.querySelectorAll(".form-sec");
        this.allSections.forEach((x: HTMLDivElement) => {
            let rfMessage: HTMLDivElement = x.querySelector(`[${this.attributes['message']}]`) as HTMLDivElement;
            if (rfMessage) rfMessage.style.display = 'none';
        })
        this.storageID = `${this.formElement.id}_rf`
        this.passwordInput = this.formElement.querySelector("input[type=password]");

        if (this.memoryExists()) this.fillFromLocal();

        for (let i = 0; i < this.allSections.length; i++) {
            let section = this.allSections[i];
            section.addEventListener('input', (_event) => {
                if (this.memory) this.saveToLocal();
                this.validateField(i)
            });
            this.validateField(i);
        }
    }
}

export default ReactiveForm;
