import nltk
from underthesea import word_tokenize
import numpy as np
import tflearn
import random
import pickle
import json
from Bot import path


data = pickle.load(open(path.getPath('trained_data'), "rb"))
words = data['words']
classes = data['classes']
train_x = data['train_x']
train_y = data['train_y']


with open(path.getJsonPath(), encoding='utf-8') as json_data:
    intents = json.load(json_data)


net = tflearn.input_data(shape=[None, len(train_x[0])])
net = tflearn.fully_connected(net, 8)
net = tflearn.fully_connected(net, 8)
net = tflearn.fully_connected(net, len(train_y[0]), activation='softmax')
net = tflearn.regression(net)


model = tflearn.DNN(net, tensorboard_dir=path.getPath('train_logs'))


def clean_up_sentence(sentence):
    sentence_words = word_tokenize(sentence.lower())
    return sentence_words


def bow(sentence, words, show_details=False):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_details:
                    print("tìm thấy trong bag: %s" % w)
    return np.array(bag)


model.load(path.getPath('model.tflearn'))


context = {}


ERROR_THRESHOLD = 0.25


def classify(sentence):
    results = model.predict([bow(sentence, words)])[0]
    results = [[i, r] for i, r in enumerate(results) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append((classes[r[0]], r[1]))
    return return_list


def response(sentence, userID='123', show_details=False):
    results = classify(sentence)
    if results:  # Nếu có kết quả vượt ngưỡng ERROR_THRESHOLD
        while results:
            for i in intents['intents']:
                if i['tag'] == results[0][0]:
                    if 'context_set' in i:
                        if show_details: print('ngữ cảnh:', i['context_set'])
                        context[userID] = i['context_set']
                    if not 'context_filter' in i or \
                            (userID in context and 'context_filter' in i and i['context_filter'] == context[userID]):
                        if show_details: print('tag:', i['tag'])
                        return print(random.choice(i['responses']))
            results.pop(0)
    # Nếu không có kết quả hoặc không khớp intent, trả về "Tôi không đoán được"
    return print("Tôi không đoán được")


classify('ai đã huấn luyện bạn')


print("Nhập 'thoát' để kết thúc")
while True:
    text = input("Câu hỏi: ")
    if text == 'thoát':
        break
    response(text)


print("Kết thúc thành công")
