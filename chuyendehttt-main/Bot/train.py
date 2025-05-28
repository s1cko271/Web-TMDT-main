import nltk
from nltk.stem.lancaster import LancasterStemmer
from underthesea import word_tokenize
import numpy as np
import tensorflow as tf
import tflearn
import random
import pickle

from Bot import path
import json

with open(path.getJsonPath(), encoding="utf-8") as json_data:
    intents = json.load(json_data)

words = []
classes = []
documents = []
ignore_words = ['?']
for intent in intents['intents']:
    for pattern in intent['patterns']:
        w = word_tokenize(pattern.lower())  # Tách từ tiếng Việt
        words.extend(w)
        documents.append((w, intent['tag']))
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

words = [w.lower() for w in words if w not in ignore_words]  # Chỉ chuyển thành chữ thường
words = sorted(list(set(words)))

classes = sorted(list(set(classes)))

print(len(documents), "Docs")
print(len(classes), "Classes", classes)
print(len(words), "Split words", words)

training = []
output = []
output_empty = [0] * len(classes)

for doc in documents:
    bag = []
    pattern_words = doc[0]
    pattern_words = [word.lower() for word in pattern_words]  # Chỉ chuyển thành chữ thường
    for w in words:
        bag.append(1) if w in pattern_words else bag.append(0)

    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1

    training.append([bag, output_row])

random.shuffle(training)
training = np.array(training, dtype=object)

train_x = list(training[:, 0])
train_y = list(training[:, 1])

# tf.reset_default_graph()
tf.keras.backend.clear_session()
net = tflearn.input_data(shape=[None, len(train_x[0])])
net = tflearn.fully_connected(net, 8)
net = tflearn.fully_connected(net, 8)
net = tflearn.fully_connected(net, len(train_y[0]), activation='softmax')
net = tflearn.regression(net)

model = tflearn.DNN(net, tensorboard_dir=path.getPath('train_logs'))
model.fit(train_x, train_y, n_epoch=20000, batch_size=500, show_metric=True)
model.save(path.getPath('model.tflearn'))


def clean_up_sentence(sentence):
    sentence_words = word_tokenize(sentence.lower())  # Tách từ tiếng Việt
    return sentence_words


def bow(sentence, words, show_details=False):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_details:
                    print("found in bag: %s" % w)
    return np.array(bag)


pickle.dump({'words': words, 'classes': classes, 'train_x': train_x, 'train_y': train_y},
            open(path.getPath('trained_data'), "wb"))
