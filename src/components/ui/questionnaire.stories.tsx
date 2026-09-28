import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

const meta = {
  title: "UI/Questionnaire",
  component: Questionnaire,
  parameters: {
    docs: {
      description: {
        component:
          "Пошаговая форма уточняющих вопросов перед генерацией — например, стиль, цвета и формат логотипа. Каждый шаг — `QuestionnaireItem` с уникальным `name`: без `multiple` варианты — радио, с `multiple` — чекбоксы. `QuestionnaireProgress` по умолчанию пишет «Вопрос 1 из 3»; свой текст — через `render` (в историях — «Шаг 1 из 3»). `Previous`/`Skip`/`Next`/`Submit` сами скрываются, когда неприменимы (например, «Пропустить» — если вопрос обязательный); по умолчанию на них «Назад», «Пропустить», «Далее», «Готово», под задачу подпись можно заменить.",
      },
    },
  },
} satisfies Meta<typeof Questionnaire>

export default meta
type Story = StoryObj<typeof meta>

export const LogoBrief: Story = {
  render: () => (
    <Questionnaire defaultItem="style" className="w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
      <QuestionnaireProgress
        render={(props, state) => <div {...props}>{`Шаг ${state.current} из ${state.total}`}</div>}
      />

      <QuestionnaireItem name="style" required>
        <QuestionnaireTitle>В каком стиле рисовать логотип?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="minimal">Минимализм</QuestionnaireChoice>
          <QuestionnaireChoice value="retro">
            Ретро
            <QuestionnaireChoiceDescription>Тёплые цвета, лёгкая зернистость</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="illustrative">Иллюстративный</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireActions>
          <QuestionnairePrevious>Назад</QuestionnairePrevious>
          <QuestionnaireSkip>Пропустить</QuestionnaireSkip>
          <QuestionnaireNext>Далее</QuestionnaireNext>
        </QuestionnaireActions>
      </QuestionnaireItem>

      <QuestionnaireItem name="colors" multiple>
        <QuestionnaireTitle>Какие цвета использовать?</QuestionnaireTitle>
        <QuestionnaireDescription>Можно выбрать несколько</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="blue">Оттенки синего</QuestionnaireChoice>
          <QuestionnaireChoice value="sand">Песочный</QuestionnaireChoice>
          <QuestionnaireChoice value="mono">Монохром</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireActions>
          <QuestionnairePrevious>Назад</QuestionnairePrevious>
          <QuestionnaireSkip>Пропустить</QuestionnaireSkip>
          <QuestionnaireNext>Далее</QuestionnaireNext>
        </QuestionnaireActions>
      </QuestionnaireItem>

      <QuestionnaireItem name="format" required>
        <QuestionnaireTitle>Для какого формата?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="square">Квадрат, для аватарки</QuestionnaireChoice>
          <QuestionnaireChoice value="story">Сторис, 9:16</QuestionnaireChoice>
          <QuestionnaireChoice value="print">Для печати</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireActions>
          <QuestionnairePrevious>Назад</QuestionnairePrevious>
          <QuestionnaireSkip>Пропустить</QuestionnaireSkip>
          <QuestionnaireSubmit>Создать</QuestionnaireSubmit>
        </QuestionnaireActions>
      </QuestionnaireItem>
    </Questionnaire>
  ),
}

export const TextQuestion: Story = {
  render: () => (
    <Questionnaire defaultItem="brief" className="w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
      <QuestionnaireItem name="brief">
        <QuestionnaireTitle>Как называется кофейня?</QuestionnaireTitle>
        <QuestionnaireDescription>Понадобится для логотипа и вывески</QuestionnaireDescription>
        <QuestionnaireInput placeholder="Например, «Прибой»" />
        <QuestionnaireActions>
          <QuestionnaireSkip>Пропустить</QuestionnaireSkip>
          <QuestionnaireSubmit>Готово</QuestionnaireSubmit>
        </QuestionnaireActions>
      </QuestionnaireItem>
    </Questionnaire>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Questionnaire defaultItem="format" className="w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
      <QuestionnaireItem name="format" required invalid>
        <QuestionnaireTitle>Для какого формата?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="square">Квадрат, для аватарки</QuestionnaireChoice>
          <QuestionnaireChoice value="story">Сторис, 9:16</QuestionnaireChoice>
          <QuestionnaireChoice value="print">Для печати</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError>Выберите формат, чтобы продолжить</QuestionnaireError>
        <QuestionnaireActions>
          <QuestionnaireSkip>Пропустить</QuestionnaireSkip>
          <QuestionnaireSubmit>Создать</QuestionnaireSubmit>
        </QuestionnaireActions>
      </QuestionnaireItem>
    </Questionnaire>
  ),
}

export const Shortcuts: Story = {
  render: () => (
    <Questionnaire
      defaultItem="style"
      shortcuts="letters"
      className="w-full max-w-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <QuestionnaireProgress
        render={(props, state) => <div {...props}>{`Шаг ${state.current} из ${state.total}`}</div>}
      />

      <QuestionnaireItem name="style" required>
        <QuestionnaireTitle>В каком стиле рисовать логотип?</QuestionnaireTitle>
        <QuestionnaireDescription>Вариант можно выбрать буквой на клавиатуре</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="minimal">Минимализм</QuestionnaireChoice>
          <QuestionnaireChoice value="retro">Ретро</QuestionnaireChoice>
          <QuestionnaireChoice value="illustrative">Иллюстративный</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireActions>
          <QuestionnairePrevious>Назад</QuestionnairePrevious>
          <QuestionnaireSkip>Пропустить</QuestionnaireSkip>
          <QuestionnaireNext>Далее</QuestionnaireNext>
        </QuestionnaireActions>
      </QuestionnaireItem>

      <QuestionnaireItem name="format" required>
        <QuestionnaireTitle>Для какого формата?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="square">Квадрат, для аватарки</QuestionnaireChoice>
          <QuestionnaireChoice value="story">Сторис, 9:16</QuestionnaireChoice>
          <QuestionnaireChoice value="print">Для печати</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireActions>
          <QuestionnairePrevious>Назад</QuestionnairePrevious>
          <QuestionnaireSkip>Пропустить</QuestionnaireSkip>
          <QuestionnaireSubmit>Создать</QuestionnaireSubmit>
        </QuestionnaireActions>
      </QuestionnaireItem>
    </Questionnaire>
  ),
}
