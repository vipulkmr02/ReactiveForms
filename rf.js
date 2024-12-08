class ReactiveForm {
    constructor(form) {
        this.formElement = form;
        this.allSections = form.querySelectorAll(".form-sec");
        this.allSections.forEach((x) => {
            let rfMessage = x.querySelector("[rf-message]");
            if (rfMessage)
                rfMessage.style.display = 'none';
        });
        this.passwordInput = this.formElement.querySelector("input[type=password]");
        for (let i = 0; i < this.allSections.length; i++) {
            let section = this.allSections[i];
            let inputElement = section.querySelector('input');
            section.addEventListener('input', (_event) => this.validateField(i));
            this.validateField(i);
        }
    }
    hideMessage(id) {
        let sr = this.allSections[id].querySelector('[rf-message]');
        sr.style.display = 'none';
    }
    validateField(id) {
        let type;
        let input = this.allSections[id].querySelector('input');
        if (input.value != "") {
            if (input.getAttribute('rf-validate') !== "")
                type = input.getAttribute('rf-validate');
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
        let pwd = this.passwordInput.value;
        let confirmPwd = this.allSections[id].querySelector('input[validate=confirm-password]');
        if (pwd === confirmPwd.value)
            this.hideMessage(id);
        else
            this.wrongValue(id, "Passwords do not match");
    }
    validatePhone(id) {
        const phoneRegex = /^\d{10}$/;
        let input = this.allSections[id].children[1];
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
        let input = this.allSections[id].children[1];
        let pwd = input.value;
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
        let x = this.allSections[id].querySelector('[rf-message]');
        x.style.display = '';
        x.innerHTML = msg;
    }
    get(name, label = false) { return label ? this.getByLabel(name) : this.getByName(name); }
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
}
export default ReactiveForm;
