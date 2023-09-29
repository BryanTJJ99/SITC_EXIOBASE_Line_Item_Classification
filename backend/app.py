from flask import Flask, request, render_template
from flask_cors import CORS, cross_origin  # comment this on deployment
import pandas as pd

import torch
from transformers import BertForSequenceClassification
from transformers import BertTokenizer
from keras_preprocessing.sequence import pad_sequences
import torch.nn.functional as F
import pandas as pd
import json


app = Flask(__name__)
CORS(app)  # comment this on deployment
cors = CORS(app, resources={r"/foo": {"origins": "*"}})


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':

        # If there's a GPU available...
        if torch.cuda.is_available():

            # Tell PyTorch to use the GPU.
            device = torch.device("cuda")
            print('There are %d GPU(s) available.' % torch.cuda.device_count())
            print('We will use the GPU:', torch.cuda.get_device_name(0))
        # If not...
        else:
            print('No GPU available, using the CPU instead.')
            device = torch.device("cpu")

        # labels subjected to change whenever a new Bert model has been trained (may contain new classes)
        # values in the labels dictionary below should correspond to the 'labels' variable in training file: https://colab.research.google.com/drive/1o8HyJ5OMwkAoJkKb35jLbHjauKDJC3en#scrollTo=W5WBk2Fg3ziH
        # Total number of labels for Exiobase category: 149

        labels = {'Air transport services': 95,
                  'Aluminium and aluminium products': 57,
                  'Aluminium ores and concentrates': 23,
                  'Anthracite': 130,
                  'Ash for treatment, re-processing of ash into clinker': 44,
                  'Aviation Gasoline': 131,
                  'BKB/Peat Briquettes': 72,
                  'Basic iron and steel and of ferro-alloys and first products thereof': 116,
                  'Beverages': 124,
                  'Bitumen': 141,
                  'Bricks, tiles and construction products, in baked clay': 92,
                  'Cattle': 16,
                  'Cement, lime and plaster': 47,
                  'Ceramic goods': 12,
                  'Cereals grains nec': 143,
                  'Charcoal': 112,
                  'Chemical and fertilizer minerals, salt and other mining and quarrying products n.e.c.': 74,
                  'Chemicals nec': 54,
                  'Coal Tar': 128,
                  'Coke Oven Coke': 118,
                  'Coking Coal': 64,
                  'Computer and related services': 6,
                  'Construction work': 40,
                  'Copper ores and concentrates': 28,
                  'Copper products': 114,
                  'Crops nec': 7,
                  'Crude petroleum and services related to crude oil extraction, excluding surveying': 35,
                  'Dairy products': 126,
                  'Electrical machinery and apparatus n.e.c.': 62,
                  'Ethane': 8,
                  'Fabricated metal products, except machinery and equipment': 18,
                  'Financial intermediation services, except insurance and pension funding services': 111,
                  'Fish and other fishing products; services incidental of fishing': 89,
                  'Fish products': 14,
                  'Food products nec': 45,
                  'Food waste for treatment: biogasification and land application': 5,
                  'Food waste for treatment: composting and land application': 77,
                  'Food waste for treatment: incineration': 42,
                  'Food waste for treatment: landfill': 125,
                  'Foundry work services': 67,
                  'Furniture; other manufactured goods n.e.c.': 134,
                  'Gas Coke': 98,
                  'Gas/Diesel Oil': 34,
                  'Gasoline Type Jet Fuel': 60,
                  'Glass and glass products': 101,
                  'Heavy Fuel Oil': 107,
                  'Hotel and restaurant services': 82,
                  'Insurance and pension funding services, except compulsory social security services': 88,
                  'Iron ores': 85,
                  'Kerosene': 119,
                  'Kerosene Type Jet Fuel': 66,
                  'Lead, zinc and tin and products thereof': 61,
                  'Lead, zinc and tin ores and concentrates': 39,
                  'Leather and leather products': 11,
                  'Lignite/Brown Coal': 52,
                  'Liquefied Petroleum': 22,
                  'Lubricants': 13,
                  'Machinery and equipment n.e.c.': 33,
                  'Manure - biogas': 76,
                  'Manure - conventional': 21,
                  'Meat animals nec': 108,
                  'Meat products nec': 100,
                  'Medical, precision and optical instruments, watches and clocks': 69,
                  'Motor Gasoline': 2,
                  'Motor vehicles, trailers and semi-trailers': 27,
                  'N-fertiliser': 49,
                  'Naphtha': 10,
                  'Natural Gas Liquids': 109,
                  'Natural gas and services related to natural gas extraction, excluding surveying': 29,
                  'Nickel ores and concentrates': 48,
                  'Non-specified Petrol': 91,
                  'Nuclear fuel': 121,
                  'Office machinery and computers': 79,
                  'Oil seeds': 80,
                  'Other Bituminous Coal': 37,
                  'Other Hydrocarbons': 144,
                  'Other land transportation services': 25,
                  'Other non-ferrous metal ores and concentrates': 123,
                  'Other non-ferrous metal products': 87,
                  'Other non-metallic mineral products': 99,
                  'Other services': 97,
                  'Other transport equipment': 148,
                  'P- and other fertiliser': 142,
                  'Paddy rice': 132,
                  'Paper and paper products': 70,
                  'Paraffin Waxes': 24,
                  'Patent Fuel': 90,
                  'Peat': 36,
                  'Petroleum Coke': 127,
                  'Pigs': 103,
                  'Plant based fibers': 137,
                  'Plastic waste for treatment: incineration': 68,
                  'Plastic waste for treatment: landfill': 133,
                  'Plastics, basic': 138,
                  'Post and telecommunications services': 136,
                  'Poultry': 120,
                  'Precious metal ores and concentrates': 9,
                  'Precious metals': 41,
                  'Printed matter and recorded media': 1,
                  'Processed rice': 93,
                  'Products of meat cattle': 96,
                  'Products of meat pigs': 51,
                  'Products of meat poultry': 19,
                  'Products of vegetable oils and fats': 139,
                  'Pulp': 106,
                  'Radio, television and communication equipment and apparatus n.e.c.': 55,
                  'Railway transportation services': 65,
                  'Raw milk': 31,
                  'Refinery Feedstocks': 84,
                  'Refinery Gas': 147,
                  'Research and development services': 146,
                  'Retail trade services of motor fuel': 53,
                  'Retail trade services, except of motor vehicles and motor cycles': 63,
                  'Rubber and plastic products': 46,
                  'Sale, maintenance, repair of motor vehicles, motor vehicles parts, motorcycles, motor cycles parts and accessories': 83,
                  'Sand and clay': 145,
                  'Sea and coastal water transportation services': 135,
                  'Secondary aluminium for treatment, re-processing of secondary aluminium into new aluminium': 38,
                  'Secondary construction material for treatment, re-processing of secondary construction material into new construction material': 129,
                  'Secondary copper for treatment, reprocessing of secondary copper into new copper': 140,
                  'Secondary glass for treatment, re-processing of secondary glass into new glass': 56,
                  'Secondary lead for treatment, reprocessing of secondary lead into new lead': 50,
                  'Secondary other non-ferrous metals for treatment, reprocessing of secondary other non-ferrous metals into new other non-ferrous metals': 78,
                  'Secondary paper for treatment, re-processing of secondary paper to new paper': 105,
                  'Secondary precious metals for treatment, re-processing of secondary precious metals into new precious metals': 71,
                  'Secondary raw materials': 75,
                  'Secondary steel for treatment, re-processing of secondary steel into new steel': 0,
                  'Stone': 3,
                  'Sub-Bituminous Coal': 20,
                  'Sugar': 4,
                  'Sugar cane, sugar beet': 73,
                  'Supporting and auxil': 30,
                  'Supporting and auxiliary transport services, travel agency services': 102,
                  'Textiles': 86,
                  'Textiles waste for treatment: incineration': 43,
                  'Textiles waste for treatment: landfill': 15,
                  'Tobacco products': 115,
                  'Transportation services via pipeline': 58,
                  'Uranium and thorium ores': 122,
                  'Vegetables, fruit, nuts': 81,
                  'Wearing apparel; furs': 26,
                  'Wheat': 104,
                  'White Spirit & SBP': 117,
                  'Wholesale trade and commission trade services, except for motor vehicles and motorcycles': 94,
                  'Wood and products of wood and cork (except furniture); articles of straw and plaiting materials': 110,
                  'Wood material fo treatment, reprocessing of secondary wood material into new wood material': 32,
                  'Wood waste for treatment: incineration': 59,
                  'Wood waste for treatment: landfill': 113,
                  'Wool, silk-worm cocoons': 17}

        model = BertForSequenceClassification.from_pretrained(
            'bert-base-uncased', num_labels=len(labels))
        model.load_state_dict(torch.load(
            'C:/Users/user/OneDrive/Documents/GitHub/unravel_items_classification/backend/bertModelparams_all_labels.pt', map_location='cpu'))  # my laptop only has cpu
        model = model.to(device)
        class_names = [x for x in range(len(labels))]

        tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

        MAX_LEN = 100  # arbitrarily indicated max length as 100

        reverse_labels = {}
        for key, value in labels.items():
            reverse_labels[value] = key

        def predict_sentiment(text):
            review_text = text

            encoded_review = tokenizer.encode_plus(
                review_text,
                max_length=MAX_LEN,
                truncation=True,
                add_special_tokens=True,
                return_token_type_ids=False,
                pad_to_max_length=False,
                return_attention_mask=True,
                return_tensors='pt',
            )

            input_ids = pad_sequences(
                encoded_review['input_ids'], maxlen=MAX_LEN, dtype=torch.Tensor, truncating="post", padding="post")
            input_ids = input_ids.astype(dtype='int64')
            input_ids = torch.tensor(input_ids)

            attention_mask = pad_sequences(
                encoded_review['attention_mask'], maxlen=MAX_LEN, dtype=torch.Tensor, truncating="post", padding="post")
            attention_mask = attention_mask.astype(dtype='int64')
            attention_mask = torch.tensor(attention_mask)

            input_ids = input_ids.reshape(1, MAX_LEN).to(device)
            attention_mask = attention_mask.to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)

            outputs = outputs[0][0].cpu().detach()

            probs = F.softmax(outputs, dim=-1).cpu().detach().numpy().tolist()
            _, prediction = torch.max(outputs, dim=-1)
            # print('p: ',prediction)
            print(f'Review text: {review_text}')
            # print("Array scores:",probs)
            # print("Prediction score:",probs[class_names[prediction]])
            return pd.Series([reverse_labels[class_names[prediction]], probs[class_names[prediction]]])

        data = request.json
        # CONVERT DATA LIST OF DICT FORMAT TO DF FORMAT
        inputDF = pd.DataFrame(data)
        print(inputDF)
        inputDF[['EXIOBASE_CAT', 'SPEND_CAT']] = inputDF[[
            'EXIOBASE_CAT', 'SPEND_CAT']].astype(str)

        inputDF['SPEND_CAT'] = inputDF['ITEM'].apply(lambda x: x)
        inputDF[['SPEND_CAT', 'EXIO_PROB']] = inputDF['SPEND_CAT'].apply(
            lambda x: predict_sentiment(x))
        print('\nmapping exiobase spent category to spent category:')

        exioDataFile = open(
            'C:/Users/user/OneDrive/Documents/GitHub/unravel_items_classification/backend/exiobase.json')
        exioData = json.load(exioDataFile)
        exioData
        exioDict = {}
        for ele in exioData:
            for item in ele['Exiobase Spend Category']:
                exioDict[item] = ele['Spend Category']

        inputDF['EXIOBASE_CAT'] = inputDF['SPEND_CAT'].apply(
            lambda x: exioDict[x])
        print('Completed!')
        print(inputDF)
        # print(inputDF.to_dict('records'))
        return {"data": inputDF.to_dict('records')}
    return render_template('upload.html')


if __name__ == '__main__':
    app.run(debug=True)
