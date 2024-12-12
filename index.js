class ReactiveForm {
    valid() {
        return this.empty() ? false :
            Array.from(this.allSections).every((x) => {
                let e = x.querySelector(`[${this.attributes['message']}]`);
                return e ? e.style.display === 'none' : true;
            });
    }
    empty() {
        return Array.from(this.allSections).some((x) => {
            let input = x.querySelector('input');
            return input.value === "";
        });
    }
    memoryExists() { return localStorage.getItem(this.storageID) ? true : false; }
    hideMessage(id) {
        let sr = this.allSections[id].querySelector(`[${this.attributes['message']}]`);
        if (sr)
            sr.style.display = 'none';
    }
    validateField(id) {
        let type;
        let input = this.allSections[id].querySelector('input');
        if (input.value != "") {
            if (input.getAttribute(this.attributes['validate']) !== "")
                type = input.getAttribute(this.attributes['validate']);
            else
                return -1;
            if (type == 'email')
                this.validateEmail(id);
            else if (type == 'username')
                this.validateUsername(id);
            else if (type == 'phone')
                this.validatePhone(id);
            else if (type == 'password')
                this.validatePassword(id);
            else if (type == 'confirm-password')
                this.validateConfirmPassword(id);
        }
        else
            this.hideMessage(id);
    }
    validateConfirmPassword(id) {
        if (!this.passwordInput) {
            console.error("No Password input in the form");
            return;
        }
        let pwd = this.passwordInput.value;
        let confirmPwd = this.allSections[id].querySelector(`input[${this.attributes['validate']}=confirm-password]`);
        if (pwd === confirmPwd.value)
            this.hideMessage(id);
        else
            this.wrongValue(id, "Passwords do not match");
    }
    validatePhone(id) {
        const phoneRegex = /^\d{10}$/;
        this.validateRegEx(id, phoneRegex, "Invalid Phone No.");
    }
    validatePassword(id) {
        const passwordRules = [
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
    validateEmail(id) {
        const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;
        this.validateRegEx(id, emailRegex, "Invalid Email");
    }
    validateUsername(id) {
        let validCharacters = {
            re: /^\w*$/,
            message: "use only Alphabets, Digits & Underscore(_)"
        };
        let length = { re: /^.{6,}$/, message: "username must be at least <strong>6</strong> characters long" };
        this.validateMultipleRules(id, [validCharacters, length]);
    }
    validateRegEx(id, regex, message) {
        let input = this.allSections[id].querySelector('input');
        if (!regex.test(input.value))
            this.wrongValue(id, message);
        else
            this.hideMessage(id);
    }
    validateMultipleRules(id, rules) {
        const value = this.allSections[id].querySelector('input').value;
        let failedRules = rules.filter(rule => !rule.re.test(value));
        if (failedRules.length > 0) {
            let errorMessages = failedRules.map(rule => rule.message).join('<br>');
            this.wrongValue(id, errorMessages);
        }
        else {
            this.hideMessage(id);
        }
    }
    wrongValue(id, msg) {
        let x = this.allSections[id].querySelector(`[${this.attributes['message']}]`);
        x.style.display = '';
        x.innerHTML = msg;
    }
    get(name, label = false) {
        return label ? this.getByLabel(name) : this.getByName(name);
    }
    getAll() {
        // return an object with the keys of input's name and value as the input's value
        return Array.from(this.formElement.querySelectorAll('input'))
            .reduce((obj, input) => {
            obj[input.name] = input.value;
            return obj;
        }, {});
    }
    getByName(name) {
        let input = this.formElement.querySelector('input[name="' + name + '"]');
        return input ? input.value : null;
    }
    getByLabel(label) {
        this.allSections.forEach((section) => {
            var _a;
            let localLabel = section.querySelector('label').textContent;
            if (localLabel === label)
                return (_a = section.querySelector('input').value) !== null && _a !== void 0 ? _a : "";
        });
    }
    saveToLocal() {
        let formData = this.getAll();
        let identifier = this.storageID;
        localStorage.setItem(identifier, JSON.stringify(formData));
    }
    getFromLocal() {
        if (!this.memoryExists())
            return;
        let data = localStorage.getItem(this.storageID);
        return data ? JSON.parse(data) : {};
    }
    fillFromLocal() {
        let json = this.getFromLocal();
        Object.keys(json).forEach((key) => this.fill(key, json[key]));
    }
    fill(name, value) {
        this.allSections.forEach((section) => {
            let input = section.querySelector(`input[name=${name}]`);
            if (input)
                input.value = value;
        });
    }
    enableMemory() { this.memory = true; }
    disableMemory() {
        localStorage.removeItem(this.storageID);
        this.memory = false;
    }
    constructor(form) {
        this.attributes = {
            'validate': 'rf-validate',
            'message': 'rf-message'
        };
        this.memory = false;
        this.formElement = form;
        this.allSections = form.querySelectorAll(".form-sec");
        this.allSections.forEach((x) => {
            let rfMessage = x.querySelector(`[${this.attributes['message']}]`);
            if (rfMessage)
                rfMessage.style.display = 'none';
        });
        this.storageID = `${this.formElement.id}_rf`;
        this.passwordInput = this.formElement.querySelector("input[type=password]");
        if (this.memoryExists())
            this.fillFromLocal();
        for (let i = 0; i < this.allSections.length; i++) {
            let section = this.allSections[i];
            section.addEventListener('input', (_event) => {
                if (this.memory)
                    this.saveToLocal();
                this.validateField(i);
            });
            this.validateField(i);
        }
    }
}
export default ReactiveForm;
