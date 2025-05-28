import nltk
from underthesea import word_tokenize
import numpy as np
import tflearn
import random
import pickle
import json
from Bot import path
nltk.download('punkt')


class ChatBot(object):


    instance = None


    @classmethod
    def getBot(cls):
        if cls.instance is None:
            cls.instance = ChatBot()
        return cls.instance


    def __init__(self):
        print("Init")
        if self.instance is not None:
            raise ValueError("Did you forget to call getBot function?")
       
        data = pickle.load(open(path.getPath('trained_data'), "rb"))
        self.words = data['words']
        self.classes = data['classes']
        train_x = data['train_x']
        train_y = data['train_y']
        with open(path.getJsonPath(), encoding='utf-8') as json_data:
            self.intents = json.load(json_data)
        net = tflearn.input_data(shape=[None, len(train_x[0])])
        net = tflearn.fully_connected(net, 8)
        net = tflearn.fully_connected(net, 8)
        net = tflearn.fully_connected(net, len(train_y[0]), activation='softmax')
        net = tflearn.regression(net)
        self.model = tflearn.DNN(net, tensorboard_dir=path.getPath('train_logs'))
        self.model.load(path.getPath('model.tflearn'))


    def clean_up_sentence(self, sentence):
        sentence_words = word_tokenize(sentence.lower())
        return sentence_words


    def bow(self, sentence, words, show_details=False):
        sentence_words = self.clean_up_sentence(sentence)
        bag = [0] * len(words)
        for s in sentence_words:
            for i, w in enumerate(words):
                if w == s:
                    bag[i] = 1
                    if show_details:
                        print("tìm thấy trong bag: %s" % w)
        return np.array(bag)


    def classify(self, sentence):
        ERROR_THRESHOLD = 0.25
        results = self.model.predict([self.bow(sentence, self.words)])[0]
        results = [[i, r] for i, r in enumerate(results) if r > ERROR_THRESHOLD]
        results.sort(key=lambda x: x[1], reverse=True)
        return_list = []
        for r in results:
            return_list.append((self.classes[r[0]], r[1]))
        return return_list


    def response(self, sentence, userID='111', show_details=False):
        results = self.classify(sentence)  # Sửa thành self.classify
        context = {}
        if results:  # Nếu có kết quả vượt ngưỡng ERROR_THRESHOLD
            while results:
                for i in self.intents['intents']:
                    if i['tag'] == results[0][0]:
                        if 'context_set' in i:
                            if show_details: print('ngữ cảnh:', i['context_set'])
                            context[userID] = i['context_set']
                        if not 'context_filter' in i or \
                                (userID in context and 'context_filter' in i and i['context_filter'] ==
                                 context[userID]):
                            if show_details: print('tag:', i['tag'])
                            return random.choice(i['responses'])
                results.pop(0)
        # Nếu không có kết quả hoặc không khớp intent, trả về "Tôi không hiểu được điều bạn nói"
        return "Tôi không hiểu được điều bạn nói"


# Thêm đoạn code để chạy trực tiếp (tùy chọn)
if __name__ == "__main__":
    bot = ChatBot.getBot()
    print("Nhập 'thoát' để kết thúc")
    while True:
        text = input("Câu hỏi: ")
        if text == 'thoát':
            break
        print(bot.response(text))
    print("Kết thúc thành công")