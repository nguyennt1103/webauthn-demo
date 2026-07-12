const registerBtn = document.getElementById("register");
registerBtn.addEventListener("click", async () => {
    // setup csrf value and header
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content;

    // get spring security creation options
    const optionsResponse = await fetch("/webauthn/register/options", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            [csrfHeader]: csrfToken
        }
    });

    // check error
    if (!optionsResponse.ok) {
        throw new Error("Failed to get creation options");
    }

    // parse json
    const optionsJson = await optionsResponse.json();

    // WebAuthn parsing support
    const pkCredCreationOptions = PublicKeyCredential.parseCreationOptionsFromJSON(optionsJson);

    // call navigator.credentials.create
    const credential = await navigator.credentials.create({
        publicKey: pkCredCreationOptions
    });

    // base64url parse
    const credentialJson = credential.toJSON();

    // send the credential to the server
    const verificationResponse = await fetch("/webauthn/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({
            publicKey: {
                credential: credentialJson,
                label: "localhost"
            }
        })
    });

    if (!verificationResponse.ok) {
        throw new Error("Failed to register a new credential");
    }

    const verificationJson = await verificationResponse.json();

    if (!(verificationJson && verificationJson.success)) {
        throw new Error("Registration process is failure");
    }
});