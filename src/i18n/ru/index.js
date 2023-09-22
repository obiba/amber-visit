export default {
  main: {
    brand: "Amber Visit",
    brand_caption: "Система интервьюирования участников",
    logout: "Выписка",
    docs: "Документы",
    forum: "Форум",
    powered_by: "Работает",
    code: "Код участника",
    investigator_help: "Нужна помощь? Свяжитесь со следователем",
    pending_save: "Ожидается сохранение данных (вы не в сети?)",
    save_now: "Сохранить сейчас",
    interview_completed: "Вы завершили интервью, спасибо за ваш вклад!",
    interval_estimate: "{count} минут",
    time_estimate: "- | 1 минута | {count} минут",
    receive_participant: "Принять участника",
    start_step: "Начать",
    continue_step: "Продолжить",
    waiting_step: "Ожидание",
    completed_step: "Завершено",
  },
  login: {
    user_title: "",
    as_user: "Я следователь",
    submit: "Отправить",
    participant_title: "",
    code: "Ваш код участника",
    participant_password: "Ваш личный пароль",
    participant_password_hint:
      "Если это ваше первое подключение, создайте пароль для защиты ваших данных. Если вы забыли пароль, обратитесь к следователю.",
    enter: "Введите",
    participant_failed:
      "Не удалось войти в систему, пожалуйста, проверьте код или обратитесь к следователю.",
    as_participant: "Я участник",
    forgot_password: "Забыли пароль?",
    register: "Зарегистрироваться",
    validate: "Проверить",
    token: "6-значный токен",
    totp: "Отсканируйте этот QR-код с помощью приложения многофакторной аутентификации (рекомендуется Microsoft authenticator), а затем введите временный токен.",
    totp_secret:
      "Или скопируйте этот секретный код для ручного добавления в приложение аутентификатора.",
    secret_copied: "Секретный код аутентификатора скопирован.",
    failed: "Неверная комбинация e-mail/пароль.",
    failed_token: "Неверный маркер.",
  },
  register: {
    title: "Зарегистрировать новое членство",
    submit: "Зарегистрироваться",
    login: "Войти",
    success:
      "Регистрация завершена! Пожалуйста, проверьте свою электронную почту, чтобы подтвердить регистрацию.",
    google_policy:
      'Этот сайт защищен reCAPTCHA, а также <a class="text-white" href="https://policies.google.com/privacy">Политикой конфиденциальности</a> и <a class="text-white" Google. href="https://policies.google.com/terms">Условия использования</a>.',
  },
  forgot_password: {
    title: "Сброс пароля",
    hint: "Введите адрес электронной почты учетной записи, чтобы сбросить пароль.",
    submit: "Перезагрузить",
    login: "Войти",
  },
  reset: {
    title: "Сброс пароля",
    submit: "Перезагрузить",
    bad_link:
      "Недействительная ссылка для сброса пароля. Пожалуйста, проверьте свою электронную почту на наличие ссылки для сброса пароля и повторите попытку.",
    failure:
      "Невозможно сбросить пароль. Пожалуйста, свяжитесь со службой поддержки.",
    success: "Пароль успешно изменен.",
  },
  verify: {
    title: "Подтвердить Email",
    login: "Войти",
    bad_link:
      "Недействительная ссылка для подтверждения электронной почты. Пожалуйста, проверьте свою электронную почту на наличие ссылки для подтверждения и повторите попытку.",
    failure:
      "Невозможно подтвердить электронную почту. Пожалуйста, свяжитесь со службой поддержки.",
    success: "Спасибо, ваш адрес электронной почты подтвержден.",
    pending: "Подтверждение учетной записи... пожалуйста, подождите...",
  },
  validations: {
    required: "Требуется значение",
    minLength: "Минимальная требуемая длина — {min}.",
    maxLength: "Максимально допустимая длина — {max}.",
    email: "Значение не является действительным адресом электронной почты.",
    strongPassword:
      "Пароль должен содержать хотя бы одно из следующих значений: строчную букву, прописную букву, цифру и специальный символ.",
  },
  email: "Email",
  password: "Пароль",
  email_hint: "Подтверждаемый адрес электронной почты.",
  password_hint:
    "Создать пароль. Минимум 8 символов в нижнем и верхнем регистре, цифрах и специальных символах.",
  firstname: "Имя",
  lastname: "Фамилия",
  preferred_language: "предпочтительный язык",
  cancel: "Отменить",
  start: "Начать",
  "Participant not found": "Участник не найден.",
  "You are not an interviewer": "Вы не являетесь интервьюером.",
  "Not a valid participant code": "Неверный код участника.",
  "Participant code is missing": "Код участника отсутствует.",
  "You are not an investigator":
    "Вы не являетесь следователем для этого участника.",
  "Interview design is not active": "Интервью не активно.",
  "Password too short": "Пароль слишком короткий.",
  close: "Закрыть",
  go_to: "Перейти к...",
  save: "Сохранить",
  pause: "Пауза",
  previous: "Предыдущий",
  next: "Следующий",
  validate_save: "Проверить и сохранить",
  validation_errors: "Ошибки проверки: {errors}",
  single_page: "Одна страница",
  multi_steps: "Несколько шагов",
  final_step_label: "Это конец формы, поздравляем!",
  required_field: "Поле является обязательным для заполнения",
  go_home: "Перейти домой",
  nothing_here: "Упс. Здесь ничего нет...",
};
