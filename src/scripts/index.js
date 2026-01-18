import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { getUserInfo, 
  getCardList,
  setUserInfo,
  setAvatar,
  addCard,
  deleteCardAPI,
  changeLikeCardStatus } from "./components/api.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const confirmDeleteModalWindow = document.querySelector(".popup_type_remove-card");
const confirmDeleteForm = confirmDeleteModalWindow.querySelector(".popup__form");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalText = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");

const logo = document.querySelector(".logo");

let userId;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  if (profileForm.checkValidity()) {
  const submitButton = profileForm.querySelector('.popup__button');
  const startText = submitButton.textContent;
  submitButton.textContent = 'Сохранение...';
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((data) => {
      profileTitle.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при изменении профиля:", err);
    })
    .finally(() => {
      submitButton.textContent = startText;
    });
  }
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  if (avatarForm.checkValidity()) {
    const submitButton = avatarForm.querySelector('.popup__button');
    const startText = submitButton.textContent;
    submitButton.textContent = 'Сохранение...';
    
    setAvatar(avatarInput.value)
      .then((data) => {
        profileAvatar.style.backgroundImage = `url(${data.avatar})`;
        closeModalWindow(avatarFormModalWindow);
      })
      .catch((err) => {
        console.log("Ошибка при изменении аватарки:", err);
      })
      .finally(() => {
        submitButton.textContent = startText;
      });
  }
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  if (cardForm.checkValidity()) {
    const submitButton = cardForm.querySelector('.popup__button');
    const startText = submitButton.textContent;
    submitButton.textContent = 'Создание...';
    
    addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
      .then((newCard) => {
        placesWrap.prepend(
          createCardElement(newCard, {
            userId: userId,
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleCardLike,
            onDeleteCard: handleCardDelete
          })
        );
        closeModalWindow(cardFormModalWindow);
      })
      .catch((err) => {
        console.log("Ошибка при создании карточки:", err);
      })
      .finally(() => {
        submitButton.textContent = startText;
      });
  }
};

const handleCardDelete = (cardElement, cardId) => {
  openModalWindow(confirmDeleteModalWindow);

  const handleConfirmDelete = (evt) => {
    evt.preventDefault();

    const submitButton = confirmDeleteForm.querySelector('.popup__button');
    const startText = submitButton.textContent;
    submitButton.textContent = 'Удаление...';

    deleteCardAPI(cardId)
      .then(() => {
        cardElement.remove();
        closeModalWindow(confirmDeleteModalWindow);
        confirmDeleteForm.removeEventListener('submit', handleConfirmDelete);
      })
      .catch((err) => {
        console.log("Ошибка при удалении карточки:", err);
      })
      .finally(() => {
        submitButton.textContent = startText;
      });
  };

  confirmDeleteForm.addEventListener('submit', handleConfirmDelete);
};

const handleCardLike = (cardId, isLiked, likeButton, likeCounter) => {

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCounter.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log("Ошибка при лайке:", err);
    });
};

// 2 Вариант

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  
  return infoItem;
};

const createUserBadge = (user) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const userBadgeItem = template.content.cloneNode(true);
  
  const badge = userBadgeItem.querySelector(".popup__list-item_type_badge");
  badge.textContent = user.name;
  
  return userBadgeItem;
};

const handleLogoClick = () => {
  cardInfoModalTitle.textContent = "Статистика пользователей";
  cardInfoModalInfoList.innerHTML = "";
  cardInfoModalText.textContent = "Все пользователи";
  cardInfoModalUserList.innerHTML = "";

  getCardList()
    .then((cards) => {

      const users = [];
      let maxCardsCount = 0;

      cards.forEach(card => {
        if (!users.some(user => user._id === card.owner._id)) {
          users.push(card.owner);
        }
        card.likes.forEach(likeUser => {
          if (!users.some(user => user._id === likeUser._id)) {
            users.push(likeUser);
          }
        });
        const ownerCards = cards.filter(cardForOwner => cardForOwner.owner._id === card.owner._id).length;
        if (ownerCards > maxCardsCount) {
          maxCardsCount = ownerCards;
        }
      });

      cardInfoModalInfoList.append(
        createInfoString(
          "Всего карточек:", 
          cards.length.toString()
        )
      );
      cardInfoModalInfoList.append(
        createInfoString(
          "Первая создана:",
          formatDate(new Date(cards[cards.length - 1].createdAt))
        )
      );
      cardInfoModalInfoList.append(
        createInfoString(
          "Последняя создана:",
          formatDate(new Date(cards[0].createdAt))
        )
      );
      cardInfoModalInfoList.append(
        createInfoString(
          "Всего пользователей:",
          users.length.toString()
        )
      );
      cardInfoModalInfoList.append(
        createInfoString(
          "Максимум карточек от одного:",
           maxCardsCount.toString()
        )
      );
      if (users.length > 0) {
        users.forEach(user => {
          cardInfoModalUserList.append(createUserBadge(user));
        });
      }
      
      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log("Ошибка при выводе статистики:", err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

logo.addEventListener("click", handleLogoClick);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  clearValidation(avatarForm, validationSettings);
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  clearValidation(cardForm, validationSettings);
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

// обработчик закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

// API
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    userId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((card) =>
      placesWrap.append(
        createCardElement(card, {
          userId,
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleCardLike,
          onDeleteCard: handleCardDelete
        })
      )
    );
  })
  .catch((err) => {
    console.log("Ошибка при загрузке данных с сервера:", err);
  });