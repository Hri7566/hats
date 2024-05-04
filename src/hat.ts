export interface IHat {
    id: string;
    url: string;
}

export let currentHat: IHat = {
    id: "",
    url: ""
};

function setCurrentHat() {}

function getCurrentHat() {
    return currentHat;
}
