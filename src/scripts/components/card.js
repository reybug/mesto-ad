const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { userId, onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCounter = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  const isLikedByMe = data.likes.some(like => like._id === userId);
  
  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  }
  
  if (likeCounter) {
    likeCounter.textContent = data.likes ? data.likes.length : 0;
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(data._id, isLikedByMe, likeButton, likeCounter));
  }

  if (data.owner._id !== userId) {
    deleteButton.style.display = 'none';
  }
  
  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};
